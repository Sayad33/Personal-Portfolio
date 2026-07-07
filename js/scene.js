// ============================================================
// Hero 3D — a single monochrome wireframe sculpture.
// A latitude/longitude sphere with an icosahedron nested inside,
// rotating slowly and tilting toward the cursor. Black lines on
// white, low opacity — texture, not decoration.
// Uses the global THREE (UMD build); degrades to nothing if the
// CDN is unreachable.
// ============================================================
(function () {
  'use strict';

  if (typeof THREE === 'undefined') return;

  var canvas = document.getElementById('hero-canvas');
  var hero = canvas ? canvas.parentElement : null;
  if (!canvas || !hero) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width: 860px)').matches;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 30);

  var group = new THREE.Group();
  scene.add(group);

  function wire(geo, opacity) {
    return new THREE.LineSegments(
      new THREE.WireframeGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0x0e0e0e, transparent: true, opacity: opacity })
    );
  }

  var sphere = wire(new THREE.SphereGeometry(9.5, 28, 18), 0.08);
  var icosa = wire(new THREE.IcosahedronGeometry(5.6, 1), 0.16);
  group.add(sphere);
  group.add(icosa);

  // desktop: sits right of the headline; mobile: faint, high and centered
  function placeGroup() {
    isMobile = window.matchMedia('(max-width: 860px)').matches;
    if (isMobile) {
      group.position.set(0, 6, -4);
      group.scale.setScalar(0.75);
      sphere.material.opacity = 0.06;
      icosa.material.opacity = 0.1;
    } else {
      group.position.set(13, 1, 0);
      group.scale.setScalar(1);
      sphere.material.opacity = 0.08;
      icosa.material.opacity = 0.16;
    }
  }
  placeGroup();

  var mouse = { x: 0, y: 0 };
  window.addEventListener('pointermove', function (e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  var clock = new THREE.Clock();

  function size() {
    var w = hero.clientWidth;
    var h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  size();

  function step() {
    var t = clock.getElapsedTime();

    sphere.rotation.y = t * 0.06;
    sphere.rotation.x = Math.sin(t * 0.1) * 0.12;
    icosa.rotation.y = -t * 0.1;
    icosa.rotation.z = t * 0.04;

    // ease the whole sculpture toward the cursor
    group.rotation.x += (mouse.y * 0.25 - group.rotation.x) * 0.04;
    group.rotation.y += (mouse.x * 0.35 - group.rotation.y) * 0.04;

    renderer.render(scene, camera);
  }

  if (reducedMotion) {
    step();
  } else {
    renderer.setAnimationLoop(step);
  }

  window.addEventListener('resize', function () {
    size();
    placeGroup();
    if (reducedMotion) step();
  });
})();
