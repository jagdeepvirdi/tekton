/* ============================================================
   preview3d.js — Three.js photorealistic table preview
   Requires window.THREE (three@0.147 UMD), THREE.OrbitControls,
   THREE.RoomEnvironment — all loaded via CDN before this script.
   Exposes on window: initPreview3D(canvas, cfg), stopPreview3D(),
                      disposePreview3D(), exportPreview3D()
   ============================================================ */

(function () {
  'use strict';

  /* ── table height by type (floor → top of slab, cm) ── */
  var TABLE_HEIGHT_CM = { dining: 75, coffee: 45, endtable: 55 };

  /* ── persistent state (survives modal close/reopen) ── */
  var _canvasCache = {};   /* wood/resin canvas elements cached per wood-id / resin-hex */
  var _renderer = null;
  var _scene    = null;
  var _camera   = null;
  var _controls = null;
  var _tableGrp = null;
  var _envTex   = null;
  var _animId   = null;
  var _lastCanvas = null;
  var _lastCfgKey = null;

  /* ── deterministic pseudo-random ── */
  function sr(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  /* ── parse hex to [r,g,b] 0-255 ── */
  function hexRGB(hex) {
    var c = new THREE.Color(hex);
    return [Math.round(c.r*255), Math.round(c.g*255), Math.round(c.b*255)];
  }
  function lerp3(a, b, t) {
    return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t];
  }

  /* ══════════════════════════════════════════════
     WOOD GRAIN — procedural canvas texture
     Technique: perturbed-V sinusoidal annual rings
                (same approach as GLSL wood shaders)
  ══════════════════════════════════════════════ */
  function drawWoodCanvas(woodData) {
    var CW = 1024, CH = 512;
    var c = document.createElement('canvas');
    c.width = CW; c.height = CH;
    var ctx = c.getContext('2d');

    var grain = hexRGB(woodData.grain);
    var base  = hexRGB(woodData.base);
    var mid   = hexRGB(woodData.mid);
    var light = hexRGB(woodData.light);

    var img  = ctx.createImageData(CW, CH);
    var data = img.data;
    var PI   = Math.PI;

    for (var py = 0; py < CH; py++) {
      var v = py / CH;
      for (var px = 0; px < CW; px++) {
        var u = px / CW;

        /* Warp V with 4 octaves — creates organic waviness of grain */
        var pv = v
          + 0.065 * Math.sin(u * PI * 2.9  + 1.9)
          + 0.030 * Math.sin(u * PI * 7.3  - 0.8)
          + 0.014 * Math.sin(u * PI * 16.1 + 2.5)
          + 0.007 * Math.sin(u * PI * 33.0 + 0.4);

        /* Annual rings — sin gives alternating dark/light bands */
        var ring = Math.pow(Math.sin(pv * PI * 52) * 0.5 + 0.5, 1.6);

        /* Fine grain lines (higher frequency) */
        var fine = Math.sin(pv * PI * 160) * 0.5 + 0.5;

        /* 3-zone color: grain-line → base → light */
        var col;
        if (ring < 0.38) {
          col = lerp3(grain, base, ring / 0.38);
        } else {
          col = lerp3(base, light, (ring - 0.38) / 0.62);
        }

        /* Fine grain darkens slightly */
        var fd = (1 - fine) * 0.10;
        var r = col[0] * (1 - fd);
        var g = col[1] * (1 - fd);
        var b = col[2] * (1 - fd);

        /* Subtle longitudinal brightness — brighter toward centre-length */
        var cx = (u - 0.5) * 2;
        var lg = 1 - cx * cx * 0.12;
        r *= lg; g *= lg; b *= lg;

        var idx = (py * CW + px) * 4;
        data[idx]   = Math.min(255, Math.max(0, r | 0));
        data[idx+1] = Math.min(255, Math.max(0, g | 0));
        data[idx+2] = Math.min(255, Math.max(0, b | 0));
        data[idx+3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    /* ── Knots (2D overlay on top of pixel data) ── */
    var kSeed = woodData.id.length * 17;
    var knots = [
      [0.18 + sr(kSeed)   * 0.08, 0.22 + sr(kSeed+1) * 0.55],
      [0.62 + sr(kSeed+2) * 0.20, 0.38 + sr(kSeed+3) * 0.48],
    ];
    knots.forEach(function(pos, ki) {
      var kx = CW * pos[0];
      var ky = CH * pos[1];
      var kr = CH * (0.028 + sr(kSeed + ki*7) * 0.022);

      /* Dark centre */
      var grd = ctx.createRadialGradient(kx, ky, 0, kx, ky, kr * 1.2);
      grd.addColorStop(0, woodData.grain);
      grd.addColorStop(0.5, woodData.grain);
      grd.addColorStop(1, 'transparent');
      ctx.globalAlpha = 0.60;
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.ellipse(kx, ky, kr * 1.4, kr * 0.85, 0.15, 0, PI * 2);
      ctx.fill();

      /* Grain ring halo */
      for (var ri = 1; ri <= 6; ri++) {
        var rr = kr * (1.6 + ri * 1.1);
        ctx.globalAlpha = 0.14 / ri;
        ctx.beginPath();
        ctx.ellipse(kx, ky, rr * 2.2, rr * 0.60, 0.15, 0, PI * 2);
        ctx.strokeStyle = woodData.grain;
        ctx.lineWidth = Math.max(0.8, 2.8 - ri * 0.3);
        ctx.stroke();
      }
    });
    ctx.globalAlpha = 1.0;
    return c;
  }

  /* ══════════════════════════════════════════════
     RESIN — procedural canvas texture
     Technique: domain-warped turbulence (simulates
     epoxy swirl / pour-layer movement)
  ══════════════════════════════════════════════ */
  function drawResinCanvas(hexColor) {
    var CW = 512, CH = 512;
    var c = document.createElement('canvas');
    c.width = CW; c.height = CH;
    var ctx = c.getContext('2d');

    var base = hexRGB(hexColor);
    var img  = ctx.createImageData(CW, CH);
    var data = img.data;
    var PI   = Math.PI;

    for (var py = 0; py < CH; py++) {
      for (var px = 0; px < CW; px++) {
        var u = px / CW;
        var v = py / CH;

        /* Domain warp — moves sample point, creates organic turbulence */
        var wx = u + 0.22 * Math.sin(v * PI * 6.1 + 0.5) + 0.11 * Math.sin(u * PI * 13.7 + 1.2);
        var wy = v + 0.22 * Math.sin(u * PI * 5.7 - 0.7) + 0.11 * Math.sin(v * PI * 11.3 + 0.9);

        /* Second warp pass (makes turbulence denser) */
        var wx2 = wx + 0.12 * Math.sin(wy * PI * 9.1 + 2.0);
        var wy2 = wy + 0.12 * Math.sin(wx * PI * 8.3 - 1.5);

        /* Multi-octave noise */
        var n  = 0.50 * (Math.sin(wx2 * PI * 4.1  + wy2 * PI * 2.7  + 0.3) * 0.5 + 0.5);
        n     += 0.25 * (Math.sin(wx2 * PI * 9.3  + wy2 * PI * 6.1  - 1.1) * 0.5 + 0.5);
        n     += 0.15 * (Math.sin(wx2 * PI * 19.7 + wy2 * PI * 11.9 + 0.7) * 0.5 + 0.5);
        n     += 0.10 * (Math.sin(wx2 * PI * 38.0 + wy2 * PI * 23.3 + 1.4) * 0.5 + 0.5);

        /* Brightness variation: dark depth ↔ light surface */
        var bright = 0.70 + n * 0.55;

        /* Highlight veins — thin bright streaks */
        var vein = Math.max(0, Math.sin(wx2 * PI * 7.3 + wy2 * PI * 4.1) - 0.82) / 0.18;
        bright += vein * 0.40;

        var idx = (py * CW + px) * 4;
        data[idx]   = Math.min(255, Math.round(base[0] * bright));
        data[idx+1] = Math.min(255, Math.round(base[1] * bright));
        data[idx+2] = Math.min(255, Math.round(base[2] * bright));
        data[idx+3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    /* Surface highlight streaks (light reflecting off polished resin) */
    ctx.globalCompositeOperation = 'screen';
    for (var i = 0; i < 5; i++) {
      var y0 = CH * (0.08 + 0.20 * i + 0.04 * Math.sin(i * 2.9));
      ctx.beginPath();
      for (var x = 0; x <= CW; x += 3) {
        var t = x / CW;
        var y = y0 + 14 * Math.sin(t * PI * 4.7 + i * 1.9) + 6 * Math.sin(t * PI * 11 + i * 3.1);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.06 + i * 0.012) + ')';
      ctx.lineWidth = 3.5 - i * 0.4;
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    return c;
  }

  /* ══════════════════════════════════════════════
     WOOD BUMP MAP — grayscale version of the same
     grain formula so it aligns pixel-perfectly with
     the colour texture.
     Bright = raised (light wood), Dark = recessed (grain line)
  ══════════════════════════════════════════════ */
  function drawWoodBumpCanvas(woodData) {
    var CW = 1024, CH = 512;
    var c = document.createElement('canvas');
    c.width = CW; c.height = CH;
    var ctx = c.getContext('2d');
    var img  = ctx.createImageData(CW, CH);
    var data = img.data;
    var PI   = Math.PI;

    for (var py = 0; py < CH; py++) {
      var v = py / CH;
      for (var px = 0; px < CW; px++) {
        var u = px / CW;

        /* IDENTICAL warp to drawWoodCanvas — keeps bump perfectly registered */
        var pv = v
          + 0.065 * Math.sin(u * PI * 2.9  + 1.9)
          + 0.030 * Math.sin(u * PI * 7.3  - 0.8)
          + 0.014 * Math.sin(u * PI * 16.1 + 2.5)
          + 0.007 * Math.sin(u * PI * 33.0 + 0.4);

        var ring = Math.pow(Math.sin(pv * PI * 52) * 0.5 + 0.5, 1.6);
        var fine = Math.sin(pv * PI * 160) * 0.5 + 0.5;

        /* Combine: primary ring height + fine grain detail */
        var bump = ring * 0.80 + fine * 0.20;

        /* Remap to avoid pure black / white at the extremes */
        var val = Math.round(30 + bump * 200);

        var idx = (py * CW + px) * 4;
        data[idx] = data[idx+1] = data[idx+2] = Math.min(255, val);
        data[idx+3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return c;
  }

  /* ── get-or-create canvas (cached per wood id / resin hex) ── */
  function woodCanvas(woodData) {
    var key = 'w_' + woodData.id;
    if (!_canvasCache[key]) _canvasCache[key] = drawWoodCanvas(woodData);
    return _canvasCache[key];
  }
  function woodBumpCanvas(woodData) {
    var key = 'wb_' + woodData.id;
    if (!_canvasCache[key]) _canvasCache[key] = drawWoodBumpCanvas(woodData);
    return _canvasCache[key];
  }
  function resinCanvas(hexColor) {
    var key = 'r_' + hexColor;
    if (!_canvasCache[key]) _canvasCache[key] = drawResinCanvas(hexColor);
    return _canvasCache[key];
  }

  /* ── build a CanvasTexture mapped to cover (x: -L/2..L/2, y: -W/2..W/2) ── */
  function canvasTex(canvas, L, effW) {
    var tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1 / L, 1 / effW);
    tex.offset.set(0.5, 0.5);
    if (_renderer) tex.anisotropy = Math.min(8, _renderer.capabilities.getMaxAnisotropy());
    return tex;
  }

  /* ── noise (mirrors preview.jsx) ── */
  function wnoise(t, seed) {
    return (
      0.55 * Math.sin(t * Math.PI * 2 * 1.3 + seed * 1.7) +
      0.30 * Math.sin(t * Math.PI * 2 * 2.7 + seed * 2.3 + 1.1) +
      0.18 * Math.sin(t * Math.PI * 2 * 5.1 + seed * 0.7 + 2.0)
    );
  }

  /* ── build a THREE.Shape from [[x,y]…] points ── */
  function shapeFromPts(pts) {
    var s = new THREE.Shape();
    s.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
    s.closePath();
    return s;
  }

  /* ── outline shapes ── */
  function rectShape(L, W, edge) {
    var hL = L / 2, hW = W / 2;
    if (edge === 'live') {
      var amp = Math.min(3, W * 0.04), nT = 24, seed = 7, pts = [];
      for (var i = 0; i <= nT; i++) { var t = i / nT; pts.push([-hL + L * t, hW + wnoise(t, seed) * amp]); }
      for (var i = 1; i <= 5; i++) { var t = i / 5; pts.push([hL + wnoise(t, seed+3) * amp * 0.5, hW - W * t]); }
      for (var i = nT; i >= 0; i--) { var t = i / nT; pts.push([-hL + L * t, -hW + wnoise(t, seed+9) * amp]); }
      for (var i = 4; i >= 1; i--) { var t = i / 5; pts.push([-hL + wnoise(t, seed+5) * amp * 0.5, hW - W * t]); }
      return shapeFromPts(pts);
    }
    var cr = Math.min(L, W) * 0.03;
    var s = new THREE.Shape();
    s.moveTo(-hL + cr, -hW);
    s.lineTo( hL - cr, -hW); s.quadraticCurveTo( hL, -hW,  hL, -hW + cr);
    s.lineTo( hL, hW - cr);  s.quadraticCurveTo( hL,  hW,  hL - cr, hW);
    s.lineTo(-hL + cr, hW);  s.quadraticCurveTo(-hL,  hW, -hL,  hW - cr);
    s.lineTo(-hL, -hW + cr); s.quadraticCurveTo(-hL, -hW, -hL + cr, -hW);
    return s;
  }

  function ovalShape(L, W, edge) {
    var rx = L / 2, ry = W / 2;
    if (edge === 'live') {
      var n = 64, pts = [];
      for (var i = 0; i < n; i++) {
        var a = (i / n) * Math.PI * 2, r = 1 + wnoise(i / n, 7) * 0.045;
        pts.push([Math.cos(a) * rx * r, Math.sin(a) * ry * r]);
      }
      return shapeFromPts(pts);
    }
    var s = new THREE.Shape();
    s.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0);
    return s;
  }

  function cookieShape(diam) {
    var R = diam / 2, seed = 3.1, n = 64, pts = [];
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      var r = 1 + 0.085 * Math.sin(a*2+seed) + 0.060 * Math.sin(a*3+seed*1.7+1)
                + 0.045 * Math.sin(a*5+seed*2.3) + 0.030 * Math.cos(a*7+seed*0.9)
                + 0.040 * Math.cos(a+seed);
      pts.push([Math.cos(a) * R * r, Math.sin(a) * R * r]);
    }
    return shapeFromPts(pts);
  }

  function outlineShape(cfg) {
    var isCookie = cfg.layout === 'cookie';
    var effW = (cfg.shapeLocked || isCookie) ? cfg.length : cfg.width;
    if (isCookie) return cookieShape(cfg.length);
    if (cfg.shape === 'round' || cfg.shape === 'oval') return ovalShape(cfg.length, effW, cfg.edge);
    return rectShape(cfg.length, effW, cfg.edge);
  }

  /* ── resin shapes (one per layout) ── */
  function resinShapes(cfg) {
    var isCookie = cfg.layout === 'cookie';
    var L  = cfg.length;
    var effW = (cfg.shapeLocked || isCookie) ? cfg.length : cfg.width;
    var isRound = cfg.shape === 'round' || cfg.shape === 'oval';
    var results = [];    /* { shape: THREE.Shape, rotY: number } */

    if (cfg.layout === 'river') {
      var n = cfg.riverCount || 1;
      var bandW = effW / (2 * n + 1);
      var placeHalf = effW * (n - 1) / (2 * n + 1);
      var angleRad = (cfg.riverAngle || 0) * Math.PI / 180;
      var organic = cfg.riverFlow === 'organic';
      var reach = L / 2;            /* exactly table half-length; keeps band inside slab */
      for (var i = 0; i < n; i++) {
        var f = n === 1 ? 0 : (i / (n - 1) - 0.5);
        var yc = f * 2 * placeHalf + (cfg.riverOffset || 0) * effW * 0.9;
        var half = bandW / 2;
        var pts = [];
        if (organic) {
          var amp = Math.min(5, bandW * 0.3), segs = 20;
          for (var j = 0; j <= segs; j++) { var t = j/segs; pts.push([-reach + 2*reach*t, yc - half + wnoise(t, i*5+4)*amp]); }
          for (var j = segs; j >= 0; j--) { var t = j/segs; pts.push([-reach + 2*reach*t, yc + half + wnoise(t, i*5+11)*amp]); }
          results.push({ shape: shapeFromPts(pts), rotY: angleRad });
        } else {
          var s = new THREE.Shape();
          s.moveTo(-reach, yc - half); s.lineTo(reach, yc - half);
          s.lineTo(reach, yc + half);  s.lineTo(-reach, yc + half);
          s.closePath();
          results.push({ shape: s, rotY: angleRad });
        }
      }

    } else if (cfg.layout === 'edgeframe') {
      var fw = Math.min(cfg.frameW || 12, Math.min(L, effW) * 0.35);
      var outer = isRound ? ovalShape(L, effW, cfg.edge) : rectShape(L, effW, cfg.edge);
      var inner = isRound ? ovalShape(L - fw*2, effW - fw*2, 'straight') : rectShape(L - fw*2, effW - fw*2, 'straight');
      outer.holes.push(inner);
      results.push({ shape: outer, rotY: 0 });

    } else if (cfg.layout === 'frames') {
      var N = cfg.frames || 5;
      for (var i = 0; i < N; i += 2) {
        var frac  = i / N,       fracN = (i + 1) / N;
        var w  = L * (1 - frac  * 0.94), h  = effW * (1 - frac  * 0.94);
        var w2 = L * (1 - fracN * 0.94), h2 = effW * (1 - fracN * 0.94);
        var outer = rectShape(w, h, 'straight');
        var inner = rectShape(w2, h2, 'straight');
        outer.holes.push(inner);
        results.push({ shape: outer, rotY: 0 });
      }

    } else if (cfg.layout === 'spiral') {
      var rMax = Math.min(L, effW) * 0.44, rMin = rMax * 0.28;
      var outer = new THREE.Shape(); outer.absellipse(0, 0, rMax,   rMax * effW/L,   0, Math.PI*2, false, 0);
      var hole  = new THREE.Shape(); hole.absellipse( 0, 0, rMin,   rMin * effW/L,   0, Math.PI*2, false, 0);
      outer.holes.push(hole);
      /* add 2 more thin rings for spiral suggestion */
      var rMid = (rMax + rMin) / 2 * 0.85;
      var rMidI = rMid * 0.82;
      var ring = new THREE.Shape(); ring.absellipse(0, 0, rMid,  rMid  * effW/L,  0, Math.PI*2, false, 0);
      var ringH = new THREE.Shape(); ringH.absellipse(0, 0, rMidI, rMidI * effW/L, 0, Math.PI*2, false, 0);
      ring.holes.push(ringH);
      results.push({ shape: outer, rotY: 0 }, { shape: ring, rotY: 0 });

    } else if (cfg.layout === 'geospiral') {
      var loops = 3;
      for (var i = 0; i < loops; i++) {
        var f1 = (i * 2)     / (loops * 2 + 1);
        var f2 = (i * 2 + 1) / (loops * 2 + 1);
        var outer = rectShape(L * (1 - f1 * 0.88), effW * (1 - f1 * 0.88), 'straight');
        var inner = rectShape(L * (1 - f2 * 0.88), effW * (1 - f2 * 0.88), 'straight');
        outer.holes.push(inner);
        results.push({ shape: outer, rotY: 0 });
      }

    } else if (cfg.layout === 'cookie') {
      /* resin cracks as thin ribbons radiating from centre */
      var R = cfg.length / 2, seed2 = 2.4;
      for (var k = 0; k < 4; k++) {
        var a0  = (k / 4) * Math.PI * 2 + seed2 * 0.7 + 0.4;
        var len = R * (0.65 + 0.2 * Math.abs(Math.sin(seed2 + k * 1.3)));
        var w2   = 2.5 - k * 0.3;
        var spine = [[Math.cos(a0)*R*0.06, Math.sin(a0)*R*0.06]];
        var ax = a0, sx = spine[0][0], sy = spine[0][1];
        for (var s = 1; s <= 7; s++) {
          ax += wnoise(s/7, seed2+k*3) * 0.7;
          sx += Math.cos(ax) * (len/7); sy += Math.sin(ax) * (len/7);
          spine.push([sx, sy]);
        }
        var perp = function(ii) {
          var dx = spine[Math.min(ii+1,spine.length-1)][0] - spine[Math.max(ii-1,0)][0];
          var dy = spine[Math.min(ii+1,spine.length-1)][1] - spine[Math.max(ii-1,0)][1];
          var ll = Math.hypot(dx, dy) || 1;
          return [-dy/ll, dx/ll];
        };
        var left  = spine.map(function(p,ii){ var nn=perp(ii); return [p[0]+nn[0]*w2, p[1]+nn[1]*w2]; });
        var right = spine.map(function(p,ii){ var nn=perp(ii); return [p[0]-nn[0]*w2, p[1]-nn[1]*w2]; });
        results.push({ shape: shapeFromPts(left.concat(right.slice().reverse())), rotY: 0 });
      }
    }
    return results;
  }

  /* ── extrude settings ── */
  function extOpts(depth, segs) {
    return {
      depth: depth,
      bevelEnabled: true,
      bevelSize: depth * 0.07,
      bevelThickness: depth * 0.05,
      bevelSegments: 2,
      curveSegments: segs || 32,
    };
  }

  /* ── materials ── */
  function woodMat(wood, L, effW) {
    var tex = canvasTex(woodCanvas(wood), L, effW);
    var bmp = canvasTex(woodBumpCanvas(wood), L, effW);
    return new THREE.MeshPhysicalMaterial({
      map:              tex,
      bumpMap:          bmp,
      bumpScale:        0.55,   /* grain depth — subtle but visible in specular */
      roughness:        0.62,   /* base wood roughness under the clearcoat */
      metalness:        0.0,
      clearcoat:        0.90,   /* lacquer / varnish layer */
      clearcoatRoughness: 0.08, /* slight micro-roughness keeps it satin not mirror */
      envMapIntensity:  0.70,
    });
  }
  function woodSideMat(wood) {
    /* side / end-grain: flat color slightly darker than base */
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(wood.grain),
      roughness: 0.85,
      metalness: 0.01,
      envMapIntensity: 0.3,
    });
  }
  function resinMat(cfg, L, effW) {
    var hexColor = cfg.resinColor || '#1763B8';
    var tex = canvasTex(resinCanvas(hexColor), L, effW);

    /* Lift very-dark colours so transmission still reads as coloured glass */
    var col = new THREE.Color(hexColor);
    var hsl = {}; col.getHSL(hsl);
    if (hsl.l < 0.12) col.setHSL(hsl.h, hsl.s, 0.15);

    return new THREE.MeshPhysicalMaterial({
      color: col,
      map: tex,
      roughness: 0.04,
      metalness: 0.0,
      transmission: 0.85,
      thickness: (cfg.thickness || 4.5) * 0.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      ior: 1.5,
      envMapIntensity: 1.6,
    });
  }
  function legMat(baseMaterial) {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(baseMaterial === 'wooden' ? '#6B4C30' : '#3A3A42'),
      roughness: baseMaterial === 'wooden' ? 0.70 : 0.30,
      metalness: baseMaterial === 'wooden' ? 0.02 : 0.88,
      envMapIntensity: 0.7,
    });
  }

  /* ── legs ── */
  function buildLegs(cfg, tableH) {
    var T   = cfg.thickness || 4.5;
    var L   = cfg.length;
    var effW = (cfg.shapeLocked || cfg.layout === 'cookie') ? cfg.length : cfg.width;
    var legH = tableH - T;
    var mat  = legMat(cfg.baseMaterial || 'metal');
    var grp  = new THREE.Group();
    var inset = 10;
    var corners = [[-L/2+inset, -effW/2+inset], [L/2-inset, -effW/2+inset],
                   [-L/2+inset,  effW/2-inset], [L/2-inset,  effW/2-inset]];

    if (cfg.base === 'hairpin') {
      corners.forEach(function(c) {
        [-6, 6].forEach(function(dx) {
          var m = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, legH, 8), mat);
          m.position.set(c[0]+dx, -legH/2, c[1]);
          m.castShadow = true;
          grp.add(m);
        });
      });
    } else if (cfg.base === 'uframe') {
      corners.forEach(function(c) {
        [-5, 5].forEach(function(dx) {
          var m = new THREE.Mesh(new THREE.BoxGeometry(3.5, legH, 3.5), mat);
          m.position.set(c[0]+dx, -legH/2, c[1]);
          m.castShadow = true;
          grp.add(m);
        });
        var cross = new THREE.Mesh(new THREE.BoxGeometry(13, 2.5, 3.5), mat);
        cross.position.set(c[0], -legH + 1.2, c[1]);
        grp.add(cross);
      });
    } else if (cfg.base === 'pedestal') {
      var post = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, legH, 16), mat);
      post.position.set(0, -legH/2, 0);
      post.castShadow = true;
      var base = new THREE.Mesh(new THREE.CylinderGeometry(L*0.20, L*0.22, 2.5, 32), mat);
      base.position.set(0, -legH - 1.25, 0);
      grp.add(post, base);
    } else {   /* box */
      corners.forEach(function(c) {
        var m = new THREE.Mesh(new THREE.BoxGeometry(11, legH, 11), mat);
        m.position.set(c[0], -legH/2, c[1]);
        m.castShadow = true;
        grp.add(m);
      });
    }
    return grp;
  }

  /* ── dispose a group's geometries + materials (including texture maps) ── */
  function disposeGroup(grp) {
    if (!grp) return;
    grp.traverse(function(obj) {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        var mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(function(m) {
          if (!m) return;
          /* dispose every texture map the material owns */
          ['map','bumpMap','normalMap','roughnessMap','metalnessMap','emissiveMap','clearcoatMap','clearcoatNormalMap'].forEach(function(k) {
            if (m[k]) { m[k].dispose(); m[k] = null; }
          });
          m.dispose();
        });
      }
    });
  }

  /* ── build table mesh group ── */
  function buildTable(cfg) {
    var woodData = (window.WOODS || []).find(function(w){ return w.id === cfg.wood; })
                 || { mid:'#7D5230', base:'#6B4226', light:'#9A6840', grain:'#4A2D18', id:'teak' };
    var T       = cfg.thickness || 4.5;
    var isCookie = cfg.layout === 'cookie';
    var L       = cfg.length;
    var effW    = (cfg.shapeLocked || isCookie) ? L : cfg.width;
    var grp     = new THREE.Group();

    /* slab */
    var slabShape = outlineShape(cfg);
    var slabGeo   = new THREE.ExtrudeGeometry(slabShape, extOpts(T, 48));
    /* ExtrudeGeometry groups: 0 = flat caps, 1 = extrusion sides */
    var slabMesh = new THREE.Mesh(slabGeo, [woodMat(woodData, L, effW), woodSideMat(woodData)]);
    slabMesh.rotation.x   = -Math.PI / 2;   /* extrude +Z → top face in +Y */
    slabMesh.castShadow   = true;
    slabMesh.receiveShadow = true;
    grp.add(slabMesh);

    /* resin inlays — protrude 0.12 cm above slab top (accurate for poured-resin tables) */
    var rMat   = resinMat(cfg, L, effW);
    var rDepth = T + 0.12;                  /* slightly deeper than slab so top face wins depth test */
    resinShapes(cfg).forEach(function(rd) {
      var geo  = new THREE.ExtrudeGeometry(rd.shape, extOpts(rDepth, 32));
      var mesh = new THREE.Mesh(geo, rMat);
      mesh.rotation.x = -Math.PI / 2;
      /* river angle: Euler XYZ — rotation.y after rotation.x rotates around world Y */
      if (rd.rotY) mesh.rotation.y = rd.rotY;
      mesh.position.y = 0;                 /* same base as slab; rDepth makes top 0.12 proud */
      mesh.castShadow    = false;
      mesh.receiveShadow = true;
      grp.add(mesh);
    });

    /* legs */
    var tableH = TABLE_HEIGHT_CM[cfg.type] || 75;
    var legs   = buildLegs(cfg, tableH);
    grp.add(legs);

    /* position: slab bottom at Y = tableH-T, top at Y = tableH */
    grp.position.y = tableH - T;

    return grp;
  }

  /* ── create / update environment (must call after renderer is created) ── */
  function buildEnv() {
    if (_envTex) { _envTex.dispose(); _envTex = null; }
    if (!THREE.RoomEnvironment || !THREE.PMREMGenerator) return;
    try {
      var pmrem = new THREE.PMREMGenerator(_renderer);
      pmrem.compileEquirectangularShader();
      _envTex = pmrem.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
      _scene.environment = _envTex;
      pmrem.dispose();
    } catch (e) {
      console.warn('preview3d: env map failed, using lights only', e);
    }
  }

  /* ── create base scene (once) ── */
  function buildScene() {
    _scene = new THREE.Scene();
    _scene.background = new THREE.Color('#0D0E11');

    buildEnv();

    /* floor grid */
    var grid = new THREE.GridHelper(1400, 60, 0x1A1B1F, 0x1A1B1F);
    grid.position.y = 0.5;
    _scene.add(grid);

    /* ambient */
    _scene.add(new THREE.AmbientLight(0xffffff, 0.28));

    /* key light — warm overhead */
    var sun = new THREE.DirectionalLight(0xfff4d6, 2.2);
    sun.position.set(180, 340, 120);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near   = 10;
    sun.shadow.camera.far    = 1800;
    sun.shadow.camera.left   = -500;
    sun.shadow.camera.right  = 500;
    sun.shadow.camera.top    = 500;
    sun.shadow.camera.bottom = -500;
    sun.shadow.radius = 5;
    sun.shadow.bias   = -0.0003;
    _scene.add(sun);

    /* fill light — cool from opposite side */
    var fill = new THREE.DirectionalLight(0xbdd0ff, 0.55);
    fill.position.set(-220, 120, -160);
    _scene.add(fill);

    /* rim light — back highlight */
    var rim = new THREE.DirectionalLight(0xffffff, 0.25);
    rim.position.set(0, 60, -300);
    _scene.add(rim);
  }

  /* ══════════════════════════════════════════════
     PUBLIC API
  ══════════════════════════════════════════════ */

  function initPreview3D(canvas, cfg) {
    if (!window.THREE || !THREE.WebGLRenderer) {
      console.warn('preview3d: THREE not loaded yet'); return;
    }

    var cfgKey      = JSON.stringify(cfg);
    var canvasSwap  = canvas !== _lastCanvas;
    var cfgChanged  = cfgKey !== _lastCfgKey;
    _lastCanvas = canvas;

    /* W/H are fixed — match the canvas width/height JSX attributes.
       Do NOT read canvas.width here: Three.js modifies it (multiplies by
       devicePixelRatio) after the first setSize call, so re-reading it on
       subsequent calls would double the resolution each time. */
    var W = 700, H = 440;

    /* ── renderer ── */
    if (!_renderer || canvasSwap) {
      if (_renderer) _renderer.dispose();
      _renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
      _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      _renderer.setSize(W, H, false);
      _renderer.shadowMap.enabled  = true;
      _renderer.shadowMap.type     = THREE.PCFSoftShadowMap;
      _renderer.outputEncoding     = THREE.sRGBEncoding;
      _renderer.toneMapping        = THREE.ACESFilmicToneMapping;
      _renderer.toneMappingExposure = 1.15;
      _renderer.physicallyCorrectLights = true;
    }
    /* no setSize on repeat calls — renderer dimensions stay at 700×440 */

    /* ── scene (once; rebuild env if renderer changed) ── */
    if (!_scene) {
      buildScene();
    } else if (canvasSwap) {
      buildEnv();   /* re-generate env for new WebGL context */
    }

    /* ── camera ── */
    if (!_camera) {
      _camera = new THREE.PerspectiveCamera(38, W / H, 1, 6000);
    } else {
      _camera.aspect = W / H;
      _camera.updateProjectionMatrix();
    }

    /* ── orbit controls (needs the actual DOM element) ── */
    if (!_controls || canvasSwap) {
      if (_controls) _controls.dispose();
      if (THREE.OrbitControls) {
        _controls = new THREE.OrbitControls(_camera, canvas);
        _controls.enableDamping  = true;
        _controls.dampingFactor  = 0.08;
        _controls.minDistance    = 60;
        _controls.maxDistance    = 2400;
        _controls.maxPolarAngle  = Math.PI / 2 - 0.015;
        _controls.enablePan      = true;
      } else {
        console.warn('preview3d: OrbitControls not available — orbit disabled');
        _controls = null;
      }
    }

    /* ── table geometry (rebuild when cfg changes) ── */
    if (cfgChanged || !_tableGrp) {
      if (_tableGrp) { disposeGroup(_tableGrp); _scene.remove(_tableGrp); _tableGrp = null; }
      _tableGrp = buildTable(cfg);
      _scene.add(_tableGrp);

      /* auto-fit camera to model (only on first build or cfg change) */
      var box    = new THREE.Box3().setFromObject(_tableGrp);
      var center = box.getCenter(new THREE.Vector3());
      var size   = box.getSize(new THREE.Vector3());
      var maxDim = Math.max(size.x, size.z);
      var dist   = maxDim * 2.0;
      _camera.position.set(
        center.x + dist * 0.65,
        center.y + dist * 0.55,
        center.z + dist * 0.80
      );
      _camera.lookAt(center);
      if (_controls) { _controls.target.copy(center); _controls.update(); }

      _lastCfgKey = cfgKey;
    }

    /* ── render loop ── */
    if (_animId) cancelAnimationFrame(_animId);
    var running = true;
    (function loop() {
      if (!running) return;
      _animId = requestAnimationFrame(loop);
      if (_controls) _controls.update();
      _renderer.render(_scene, _camera);
    })();

    /* expose a stop handle so React useEffect cleanup can pause the loop
       without destroying the scene */
    window._preview3d_stop = function() {
      running = false;
      if (_animId) { cancelAnimationFrame(_animId); _animId = null; }
    };
  }

  function stopPreview3D() {
    if (window._preview3d_stop) window._preview3d_stop();
  }

  function disposePreview3D() {
    stopPreview3D();
    if (_tableGrp) { disposeGroup(_tableGrp); if (_scene) _scene.remove(_tableGrp); _tableGrp = null; }
    if (_controls) { _controls.dispose(); _controls = null; }
    if (_envTex)   { _envTex.dispose(); _envTex = null; }
    if (_scene) {
      _scene.traverse(function(obj) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(function(m){ if(m&&m.dispose)m.dispose(); });
      });
      _scene = null;
    }
    if (_renderer) { _renderer.dispose(); _renderer = null; }
    _camera = null; _lastCanvas = null; _lastCfgKey = null;
  }

  function exportPreview3D() {
    if (!_renderer || !_scene || !_camera) return null;
    _renderer.render(_scene, _camera);
    return _renderer.domElement.toDataURL('image/jpeg', 0.92);
  }

  Object.assign(window, { initPreview3D: initPreview3D, stopPreview3D: stopPreview3D,
                           disposePreview3D: disposePreview3D, exportPreview3D: exportPreview3D });
})();
