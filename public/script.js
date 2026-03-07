// CandyVerse — Three.js Landing (Pink Cloud Sky Edition)
(function () {
  "use strict";

  var canvas = document.getElementById('candy-canvas');
  var W = window.innerWidth, H = window.innerHeight;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.setClearColor(0xFFB3D9, 1);

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xFFCCE5, 0.020);

  var camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 300);
  camera.position.set(0, 9, 22);
  camera.lookAt(0, 9, 0);

  // Mouse
  var mouse = { x: 0, y: 0 };
  document.addEventListener('mousemove', function(e) {
    mouse.x = (e.clientX / window.innerWidth)  *  2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) *  2 + 1;
    var cur = document.getElementById('cursor');
    var trail = document.getElementById('cursor-trail');
    if (cur)   { cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px'; }
    if (trail) { trail.style.left = e.clientX + 'px'; trail.style.top = e.clientY + 'px'; }
    if (Math.random() > 0.82) spawnCursorParticle(e.clientX, e.clientY);
  });

  // Lighting
  scene.add(new THREE.AmbientLight(0xFFE0EE, 0.9));

  var sun = new THREE.DirectionalLight(0xFFFAFB, 1.2);
  sun.position.set(6, 20, 10);
  sun.castShadow = true;
  scene.add(sun);

  var pinkFill = new THREE.PointLight(0xFF80AB, 1.8, 28);
  pinkFill.position.set(-6, 8, 5);
  scene.add(pinkFill);

  var blueFill = new THREE.PointLight(0x80D8FF, 1.4, 22);
  blueFill.position.set(6, 5, 6);
  scene.add(blueFill);

  var goldenFill = new THREE.PointLight(0xFFE66D, 1.2, 14);
  goldenFill.position.set(0, 12, -2);
  scene.add(goldenFill);

  // Sky dome — large sphere, back-face, vertex colour gradient
  var skyGeo = new THREE.SphereGeometry(150, 32, 32);
  var skyPos = skyGeo.attributes.position;
  var skyCol = new Float32Array(skyPos.count * 3);
  for (var si = 0; si < skyPos.count; si++) {
    var sy = skyPos.getY(si);
    var st = Math.max(0, Math.min(1, (sy + 150) / 300));
    // bottom: pale pink-white  top: soft warm pink
    skyCol[si*3]   = 1.0;
    skyCol[si*3+1] = 0.78 + st * 0.12;
    skyCol[si*3+2] = 0.90 + st * 0.06;
  }
  skyGeo.setAttribute('color', new THREE.BufferAttribute(skyCol, 3));
  scene.add(new THREE.Mesh(skyGeo,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));

  // Sparkle stars
  var STARS = 700;
  var sPos = new Float32Array(STARS * 3);
  var sCol = new Float32Array(STARS * 3);
  var sPalette = [
    [1,1,1], [1,0.95,0.3], [1,0.55,0.78], [0.45,0.88,1], [1,0.78,0.90]
  ];
  for (var i = 0; i < STARS; i++) {
    var theta = Math.random() * Math.PI * 2;
    var phi   = Math.random() * Math.PI * 0.68;
    var r     = 30 + Math.random() * 60;
    sPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    sPos[i*3+1] = 6 + r * Math.cos(phi);
    sPos[i*3+2] = r * Math.sin(phi) * Math.sin(theta) - 10;
    var sc = sPalette[Math.floor(Math.random() * sPalette.length)];
    sCol[i*3] = sc[0]; sCol[i*3+1] = sc[1]; sCol[i*3+2] = sc[2];
  }
  var starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  starGeo.setAttribute('color',    new THREE.BufferAttribute(sCol, 3));
  var starMat = new THREE.PointsMaterial({
    size: 0.38, vertexColors: true,
    transparent: true, opacity: 1.0,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  });
  var starPoints = new THREE.Points(starGeo, starMat);
  scene.add(starPoints);

  // Cloud builder
  function buildCloud(x, y, z, scale, opacity) {
    scale   = scale   || 1;
    opacity = opacity || 0.95;
    var grp = new THREE.Group();
    var mat = new THREE.MeshPhongMaterial({
      color: 0xFFFFFF, emissive: 0xFFE0EE, emissiveIntensity: 0.10,
      transparent: true, opacity: opacity, shininess: 10
    });
    var blobs = [
      [0,0,0,1.7],   [-1.4,-0.2,0,1.2],  [1.4,-0.2,0,1.2],
      [-0.7,0.7,0,1.0],[0.7,0.7,0,1.0],  [0,0.9,0,1.1],
      [-2.2,-0.6,0,0.8],[2.2,-0.6,0,0.8],
      [0,-0.3,0.8,1.0],[0,-0.3,-0.8,0.9]
    ];
    for (var bi = 0; bi < blobs.length; bi++) {
      var b = blobs[bi];
      var mesh = new THREE.Mesh(new THREE.SphereGeometry(b[3], 9, 9), mat);
      mesh.position.set(b[0], b[1], b[2]);
      grp.add(mesh);
    }
    grp.position.set(x, y, z);
    grp.scale.setScalar(scale);
    grp.userData.driftX   = (Math.random() - 0.5) * 0.003;
    grp.userData.bobPhase = Math.random() * Math.PI * 2;
    grp.userData.bobAmp   = 0.004 + Math.random() * 0.006;
    grp.userData.bobSpeed = 0.20  + Math.random() * 0.35;
    return grp;
  }

  var clouds = [];

  // Platform clouds hut sits on
  var platformDefs = [
    [0,   -0.5, 0,   3.8, 0.98],
    [-5.5,-1.2, 0,   2.2, 0.94],
    [ 5.5,-1.2, 0,   2.2, 0.94],
    [-3,  -1.5,-3,   1.8, 0.90],
    [ 3,  -1.5,-3,   1.8, 0.90],
    [-2,  -1.8, 4,   1.5, 0.88],
    [ 2,  -1.8, 4,   1.5, 0.88],
    [ 0,  -2.2,-5,   2.0, 0.86]
  ];
  for (var pi = 0; pi < platformDefs.length; pi++) {
    var pd = platformDefs[pi];
    var pc = buildCloud(pd[0],pd[1],pd[2],pd[3],pd[4]);
    scene.add(pc); clouds.push(pc);
  }

  // Background clouds
  var bgDefs = [
    [-14, 2,-12, 2.8,0.72],[14,  3,-14, 3.0,0.68],
    [-10, 5,-18, 2.2,0.58],[10,  4,-16, 2.5,0.60],
    [  0, 7,-22, 3.5,0.50],[-18, 1, -8, 2.0,0.55],
    [ 18, 2, -9, 2.0,0.55],[-5,  8,-25, 2.8,0.42],
    [  5, 9,-28, 2.4,0.40],[-22, 4,-15, 1.8,0.45],
    [ 22, 5,-18, 2.0,0.45],[  0,12,-35, 4.0,0.35]
  ];
  for (var bgi = 0; bgi < bgDefs.length; bgi++) {
    var bd = bgDefs[bgi];
    var bc = buildCloud(bd[0],bd[1],bd[2],bd[3],bd[4]);
    scene.add(bc); clouds.push(bc);
  }

  // Material helper
  function cmat(color, emissive, shine) {
    emissive = emissive || 0x110000;
    shine    = shine    || 130;
    return new THREE.MeshPhongMaterial({
      color: color, emissive: emissive, emissiveIntensity: 0.18,
      shininess: shine, specular: 0xffffff
    });
  }

  // ── Candy Hut ────────────────────────────────────────
  var hut = new THREE.Group();
  scene.add(hut);

  // Walls
  var walls = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 4), cmat(0xFFB3CF, 0xFF80AB, 90));
  walls.castShadow = true; walls.receiveShadow = true;
  hut.add(walls);

  // Corner stripes
  var smat = new THREE.MeshPhongMaterial({ color:0xFFFFFF, emissive:0xFFDDEE, emissiveIntensity:0.3, shininess:110 });
  for (var ci = 0; ci < 4; ci++) {
    var ca = (ci / 4) * Math.PI * 2;
    var cs = new THREE.Mesh(new THREE.BoxGeometry(0.22, 3.06, 0.22), smat);
    cs.position.set(Math.cos(ca)*2, 0, Math.sin(ca)*2);
    hut.add(cs);
  }

  // Horizontal bands
  for (var hi = -1; hi <= 1; hi++) {
    var band = new THREE.Mesh(new THREE.BoxGeometry(4.06,0.22,4.06),
      new THREE.MeshPhongMaterial({ color:0xFF80AB, shininess:80 }));
    band.position.y = hi * 1.1;
    hut.add(band);
  }

  // Roof
  var roof = new THREE.Mesh(new THREE.ConeGeometry(3.3, 2.9, 6), cmat(0xFF4D8F, 0xFF1A6C, 120));
  roof.position.y = 2.9; roof.castShadow = true; hut.add(roof);

  // Roof ribs
  var ribMat = new THREE.MeshPhongMaterial({ color:0xFFFFFF, emissive:0xFFEEF5, emissiveIntensity:0.35 });
  for (var ri = 0; ri < 6; ri++) {
    var ra = (ri / 6) * Math.PI * 2;
    var rib = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.88, 0.18), ribMat);
    rib.position.set(Math.cos(ra)*1.18, 2.9, Math.sin(ra)*1.18);
    hut.add(rib);
  }

  // Glowing tip
  var tip = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), cmat(0xFFE66D, 0xFFCC00, 230));
  tip.position.y = 4.45; hut.add(tip);

  var tipLight = new THREE.PointLight(0xFFE66D, 1.5, 6);
  tipLight.position.y = 4.45; hut.add(tipLight);

  // Door
  var door = new THREE.Mesh(new THREE.BoxGeometry(1, 1.6, 0.16), cmat(0xA0522D, 0x5c2a00, 60));
  door.position.set(0, -0.7, 2.09);
  hut.add(door);

  // Arch
  var arch = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.10, 8, 20, Math.PI), cmat(0xFFE66D, 0xFFAA00, 160));
  arch.position.set(0, 0.12, 2.09);
  hut.add(arch);

  // Windows
  var winMat = new THREE.MeshPhongMaterial({
    color:0x80D8FF, emissive:0x44CCFF, emissiveIntensity:1.0,
    shininess:220, transparent:true, opacity:0.78
  });
  var winData = [[-1.3,0.3,2.09,false],[1.3,0.3,2.09,false],[2.09,0.3,-1.3,true],[-2.09,0.3,-1.3,true]];
  for (var wi = 0; wi < winData.length; wi++) {
    var wd = winData[wi];
    var win = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.16), winMat);
    win.position.set(wd[0], wd[1], wd[2]);
    if (wd[3]) win.rotation.y = Math.PI / 2;
    hut.add(win);
  }

  // Chimney
  var chim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, 1.5, 8), cmat(0xFF80AB, 0xFF2266, 65));
  chim.position.set(1.2, 4.52, -0.8); chim.castShadow = true; hut.add(chim);

  // Candy cane fences
  function makeFence(x, z) {
    var g = new THREE.Group();
    var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 1.5, 8),
      new THREE.MeshPhongMaterial({ color:0xFFFFFF, shininess:110 }));
    pole.position.y = 0.75; g.add(pole);
    for (var fi = 0; fi < 3; fi++) {
      var ring = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.042, 6, 20), cmat(0xFF4D8F, 0xCC0044, 85));
      ring.position.y = 0.3 + fi * 0.45; ring.rotation.x = Math.PI / 2; g.add(ring);
    }
    var hook = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.068, 6, 20, Math.PI), cmat(0xFF4D8F, 0xCC0044, 85));
    hook.position.y = 1.68; hook.rotation.z = Math.PI / 2; g.add(hook);
    g.position.set(x, -1.38, z);
    return g;
  }
  var fencePos = [[-3.5,3],[-3.5,0],[-3.5,-3],[3.5,3],[3.5,0],[3.5,-3],[-1.5,3.5],[1.5,3.5]];
  for (var fpi = 0; fpi < fencePos.length; fpi++) {
    hut.add(makeFence(fencePos[fpi][0], fencePos[fpi][1]));
  }

  // Path stones
  for (var sti = 0; sti < 5; sti++) {
    var stone = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.09, 0.5), cmat(0xFFCCE5, 0xFF99BB, 40));
    stone.position.set(sti % 2 === 0 ? -0.4 : 0.4, -1.42, 3.2 + sti * 0.55);
    hut.add(stone);
  }

  hut.position.y = 8.6; // sits exactly on top of cloud platform (cloud top = 7.1, walls bottom = -1.5)

  // Halo rings
  var haloGrp = new THREE.Group();
  var halo1 = new THREE.Mesh(new THREE.TorusGeometry(5.8, 0.075, 8, 80),
    new THREE.MeshBasicMaterial({ color:0xFF80AB, transparent:true, opacity:0.55 }));
  halo1.rotation.x = Math.PI / 2.2; halo1.position.y = 12.5; haloGrp.add(halo1);

  var halo2 = new THREE.Mesh(new THREE.TorusGeometry(6.6, 0.05, 8, 80),
    new THREE.MeshBasicMaterial({ color:0x80D8FF, transparent:true, opacity:0.38 }));
  halo2.rotation.x = Math.PI / 2.5; halo2.position.y = 13.2; haloGrp.add(halo2);

  var halo3 = new THREE.Mesh(new THREE.TorusGeometry(4.8, 0.06, 8, 80),
    new THREE.MeshBasicMaterial({ color:0xFFE66D, transparent:true, opacity:0.40 }));
  halo3.rotation.x = Math.PI / 2.0; halo3.position.y = 11.8; haloGrp.add(halo3);
  scene.add(haloGrp);

  // Floating candies
  var floaters = [];

  function makeLollipop(c1, c2, x, y, z) {
    var g = new THREE.Group();
    var stick = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 8),
      new THREE.MeshPhongMaterial({ color:0xFFFFFF, shininess:65 }));
    stick.position.y = -0.72; g.add(stick);
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.4, 18, 18), cmat(c1, c2, 170)));
    var sw = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.058, 6, 28, Math.PI * 3), cmat(c2, c1, 110));
    sw.rotation.z = Math.PI / 4; g.add(sw);
    g.position.set(x, y, z);
    g.userData = { by:y, sp:0.5+Math.random()*0.8, ph:Math.random()*Math.PI*2, rs:(Math.random()-0.5)*0.022 };
    return g;
  }

  function makeGummy(col, x, y, z) {
    var g   = new THREE.Group();
    var mat = cmat(col, 0x330011, 130);
    var bg  = new THREE.SphereGeometry(0.35, 12, 12); bg.scale(1, 1.2, 0.85);
    g.add(new THREE.Mesh(bg, mat));
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), mat);
    head.position.y = 0.55; g.add(head);
    var earPos = [[-0.17, 0.82], [0.17, 0.82]];
    for (var ei = 0; ei < earPos.length; ei++) {
      var ear = new THREE.Mesh(new THREE.SphereGeometry(0.10, 8, 8), mat);
      ear.position.set(earPos[ei][0], earPos[ei][1], 0); g.add(ear);
    }
    var eyeMat = new THREE.MeshPhongMaterial({ color:0x222222, shininess:200 });
    var eyePos = [[-0.10, 0.56], [0.10, 0.56]];
    for (var eyi = 0; eyi < eyePos.length; eyi++) {
      var eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), eyeMat);
      eye.position.set(eyePos[eyi][0], eyePos[eyi][1], 0.25); g.add(eye);
    }
    g.position.set(x, y, z);
    g.userData = { by:y, sp:0.4+Math.random()*0.6, ph:Math.random()*Math.PI*2, rs:(Math.random()-0.5)*0.025 };
    return g;
  }

  function makeStar3D(col, x, y, z) {
    var g   = new THREE.Group();
    var mat = cmat(col, col, 210);
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.14), mat));
    for (var sti2 = 0; sti2 < 5; sti2++) {
      var a2 = (sti2 / 5) * Math.PI * 2;
      var pt = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 4), mat);
      pt.position.set(Math.cos(a2)*0.29, Math.sin(a2)*0.29, 0);
      pt.rotation.z = -a2; g.add(pt);
    }
    g.position.set(x, y, z);
    g.userData = { by:y, sp:0.6+Math.random(), ph:Math.random()*Math.PI*2, rs:0.035 };
    return g;
  }

  var candyList = [
    makeLollipop(0xFF4D8F, 0xFF1A6C, -8.0, 11.0, -2.0),
    makeLollipop(0x80D8FF, 0x00B4FF,  8.0, 12.0, -3.0),
    makeLollipop(0xFFE66D, 0xFFA726, -6.0, 14.0, -4.0),
    makeLollipop(0xFF80AB, 0xFF4D8F,  7.0, 13.0,  1.5),
    makeLollipop(0x6BFFB8, 0x00C853, -4.0, 15.0, -6.0),
    makeGummy(0xFF80AB, -7.0, 12.0,  2.5),
    makeGummy(0xFFE66D,  6.0, 11.5, -1.5),
    makeGummy(0x80D8FF, -3.0, 16.0, -4.0),
    makeGummy(0xFFB3CF,  9.0, 10.5, -5.0),
    makeStar3D(0xFFE66D,  5.0, 15.0, -6.5),
    makeStar3D(0xFF80AB, -9.0, 13.0, -4.5),
    makeStar3D(0x80D8FF,  0.0, 17.0, -7.0)
  ];
  for (var cli = 0; cli < candyList.length; cli++) {
    scene.add(candyList[cli]); floaters.push(candyList[cli]);
  }

  // Hearts
  var hearts = [];
  function spawnHeart() {
    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo( 0,  0.28, -0.55,  0.46, -0.55,  0.18);
    shape.bezierCurveTo(-0.55, -0.10,    0, -0.28,     0, -0.46);
    shape.bezierCurveTo(    0, -0.28,  0.55, -0.10,  0.55,  0.18);
    shape.bezierCurveTo( 0.55,  0.46,     0,  0.28,     0,     0);
    var hcols = [0xFF4D8F, 0xFF80AB, 0xFFB3CF, 0xFF1A6C, 0xFFE66D];
    var h = new THREE.Mesh(
      new THREE.ShapeGeometry(shape),
      new THREE.MeshBasicMaterial({
        color: hcols[Math.floor(Math.random()*hcols.length)],
        transparent: true, opacity: 0.7,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    h.scale.setScalar(0.15 + Math.random() * 0.3);
    h.position.set((Math.random()-0.5)*24, 5+Math.random()*3, (Math.random()-0.5)*18);
    h.userData = { sp: 0.25+Math.random()*0.45, wb:(Math.random()-0.5)*0.016, op:0.35+Math.random()*0.4 };
    scene.add(h); hearts.push(h);
  }
  for (var hti = 0; hti < 40; hti++) spawnHeart();

  // Smoke
  var smokeP = [];
  function spawnSmoke() {
    var scols = [0xFFB3CF, 0xFFFFFF, 0x80D8FF, 0xFFE66D, 0xFF80AB];
    var s = new THREE.Mesh(
      new THREE.SphereGeometry(0.1 + Math.random()*0.18, 8, 8),
      new THREE.MeshBasicMaterial({
        color: scols[Math.floor(Math.random()*scols.length)],
        transparent:true, opacity:0.6,
        blending:THREE.AdditiveBlending, depthWrite:false
      })
    );
    s.position.set(1.2+(Math.random()-0.5)*0.3, 13.3, -0.8+(Math.random()-0.5)*0.3);
    s.userData = { vy:0.042+Math.random()*0.03, vx:(Math.random()-0.5)*0.013, vz:(Math.random()-0.5)*0.013, life:1, decay:0.007+Math.random()*0.005 };
    scene.add(s); smokeP.push(s);
  }

  // DOM cursor sparkles
  var emojis = ['🍭','🍬','💖','⭐','✨','🌸','💕','🎀','🍡','🌟','🧁','🌈'];
  function spawnCursorParticle(x, y) {
    var el = document.createElement('div');
    el.style.cssText = 'position:fixed;pointer-events:none;z-index:9997;' +
      'left:' + (x+(Math.random()-0.5)*44) + 'px;' +
      'top:'  + (y+(Math.random()-0.5)*44) + 'px;' +
      'font-size:' + (0.85+Math.random()*0.9) + 'rem;' +
      'animation:floatUp ' + (1.4+Math.random()) + 's linear forwards;';
    el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    document.body.appendChild(el);
    setTimeout(function(){ el.remove(); }, 2400);
  }

  // DOM sparkle dots
  var sparkContainer = document.getElementById('sparkles');
  var sparkCols = ['#FF4D8F','#FF80AB','#FFE66D','#80D8FF','#FFFFFF','#FFB3CF','#FF1A6C'];
  function addDOMSparkle() {
    var s = document.createElement('div');
    s.className = 'sparkle';
    var size = 2 + Math.random()*7;
    s.style.cssText =
      'left:' + Math.random()*100 + 'vw;' +
      'top:'  + Math.random()*100 + 'vh;' +
      'width:' + size + 'px;height:' + size + 'px;' +
      'background:' + sparkCols[Math.floor(Math.random()*sparkCols.length)] + ';' +
      'animation:sparkleTwinkle ' + (1+Math.random()*2.5) + 's ' + Math.random()*2 + 's linear infinite;';
    sparkContainer.appendChild(s);
    setTimeout(function(){ s.remove(); }, 6000);
  }
  for (var di = 0; di < 100; di++) addDOMSparkle();
  setInterval(addDOMSparkle, 120);

  // Animation loop
  var autoAngle = 0, smokeTimer = 0, t = 0;

  function animate() {
    requestAnimationFrame(animate);
    t += 0.016;
    smokeTimer += 0.016;
    if (smokeTimer > 0.36) { spawnSmoke(); smokeTimer = 0; }

    // Auto-rotate camera
    autoAngle += 0.0022;
    camera.position.x = Math.cos(autoAngle) * 20 + mouse.x * 1.6;
    camera.position.z = Math.sin(autoAngle) * 20;
    camera.position.y = 9 + mouse.y * 1.5;
    camera.lookAt(0, 9.5, 0);

    // Hut spin
    hut.rotation.y += 0.0038;

    // Halos
    haloGrp.rotation.y += 0.006;
    halo1.material.opacity = 0.38 + Math.sin(t*1.4)*0.20;
    halo2.material.opacity = 0.22 + Math.cos(t*1.9)*0.15;
    halo3.material.opacity = 0.28 + Math.sin(t*2.2)*0.15;
    halo1.scale.setScalar(1 + Math.sin(t)*0.05);

    // Tip glow
    tip.material.emissiveIntensity = 0.5 + Math.sin(t*3.5)*0.38;
    tip.scale.setScalar(1 + Math.sin(t*4)*0.20);
    tipLight.intensity = 1.2 + Math.sin(t*3)*0.5;

    // Stars
    starMat.opacity = 0.75 + Math.sin(t*2.8)*0.25;
    starPoints.rotation.y += 0.0003;

    // Lights pulse
    pinkFill.intensity = 1.6 + Math.sin(t*1.8)*0.4;
    blueFill.intensity = 1.2 + Math.cos(t*1.5)*0.3;

    // Floating candies
    for (var fi = 0; fi < floaters.length; fi++) {
      var fl = floaters[fi];
      fl.position.y = fl.userData.by + Math.sin(t*fl.userData.sp + fl.userData.ph)*0.75;
      fl.rotation.y += fl.userData.rs;
      fl.rotation.z = Math.sin(t*fl.userData.sp*0.5 + fl.userData.ph)*0.22;
    }

    // Clouds bob + drift
    for (var cdi = 0; cdi < clouds.length; cdi++) {
      var cl = clouds[cdi];
      cl.position.x += cl.userData.driftX;
      cl.position.y += Math.sin(t*cl.userData.bobSpeed + cl.userData.bobPhase)*cl.userData.bobAmp;
      if (cl.position.x >  25) cl.position.x = -25;
      if (cl.position.x < -25) cl.position.x =  25;
    }

    // Hearts
    for (var hri = 0; hri < hearts.length; hri++) {
      var hr = hearts[hri];
      hr.position.y += hr.userData.sp * 0.016;
      hr.position.x += hr.userData.wb;
      hr.rotation.z += 0.009;
      hr.material.opacity = hr.userData.op * (0.5 + 0.5*Math.sin(t*1.8));
      if (hr.position.y > 26) {
        hr.position.y = 5;
        hr.position.x = (Math.random()-0.5)*24;
        hr.position.z = (Math.random()-0.5)*18;
      }
    }

    // Smoke
    for (var smi = smokeP.length-1; smi >= 0; smi--) {
      var sm = smokeP[smi];
      sm.position.y += sm.userData.vy;
      sm.position.x += sm.userData.vx;
      sm.position.z += sm.userData.vz;
      sm.userData.life -= sm.userData.decay;
      sm.material.opacity = sm.userData.life * 0.6;
      sm.scale.setScalar(1 + (1-sm.userData.life)*2.8);
      if (sm.userData.life <= 0) { scene.remove(sm); smokeP.splice(smi,1); }
    }

    renderer.render(scene, camera);
  }

  window.addEventListener('resize', function() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h); camera.aspect = w/h; camera.updateProjectionMatrix();
  });

  // Fade out loading
  setTimeout(function() {
    var ld = document.getElementById('loading');
    if (ld) { ld.classList.add('fade-out'); setTimeout(function(){ ld.remove(); }, 900); }
  }, 1000);

  animate();
})();
