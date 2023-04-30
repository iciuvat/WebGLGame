var lost_games = 0;

const base_limit_right = 1.35;
const base_step = 0.15;
const base_width = 0.50;
const base_height = 0.15;
var base_x = 0;
var sphere;
var time = 100;
var sphere_direction_x = 1;
var sphere_direction_y = 1;
const sphere_limit_right = 1.55;
const sphere_limit_top = 1.15;
const sphere_step = 0.01;

if (!Detector.webgl) {
  Detector.addGetWebGLMessage();
}

var container;

var camera, controls, scene, renderer;
var lighting, ambient, keyLight, fillLight, backLight;

init();
animate();

function init() {

  var canvas = document.getElementById('glcanvas');

  camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 1000);
  camera.position.z = 3;

  scene = new THREE.Scene();
  lighting = false;

  ambient = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambient);

  keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
  keyLight.position.set(-100, 0, 100);

  fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
  fillLight.position.set(100, 0, 100);

  backLight = new THREE.DirectionalLight(0xffffff, 1.0);
  backLight.position.set(100, 0, -100).normalize();

  // Model
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.setBaseUrl('assets/');
  mtlLoader.setPath('assets/');

  function load_obj (file_name) {
    mtlLoader.load(file_name + '.mtl', function (materials) {

        materials.preload();
        if (materials.materials.default != undefined) {
          materials.materials.default.map.magFilter = THREE.NearestFilter;
          materials.materials.default.map.minFilter = THREE.LinearFilter;
        }

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('assets/');
        objLoader.load(file_name + '.obj', function (object) {
          object.name = file_name;
          scene.add(object);
          if (file_name == 'base') {
            object.scale.setScalar(1/50);
            object.position.y = -1.05;
          }
        });

    });
  }

  load_obj('base');

  var geometry = new THREE.SphereGeometry( 0.1, 32, 16 );
  var material = new THREE.MeshBasicMaterial( {
      map: new THREE.TextureLoader().load( 'assets/logo.jpg' )
  } );

  sphere = new THREE.Mesh( geometry, material );
  scene.add( sphere );

  
  renderer = new THREE.WebGLRenderer( { canvas: canvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvas.width, canvas.height);
  renderer.setClearColor(new THREE.Color("hsl(0, 0%, 10%)"));

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.dampingFactor = 0.25;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableRotate = false;

  window.addEventListener('keydown', onKeyboardEvent, false);

  new Promise((resolve) => setTimeout(resolve, 5000));
}

function onKeyboardEvent(e) {
  if (e.code === 'ArrowRight') {    
    if (base_x + base_step < base_limit_right) {
      base_x += base_step;
    }
  }
  if (e.code === 'ArrowLeft') {
    var obj_base = scene.getObjectByName( "base" );
    if (base_x - base_step >= - base_limit_right) {
      base_x -= base_step;
    }
  }
  
  if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
    scene.getObjectByName( "base" ).position.x = base_x;
  }
  
  if (e.code === 'KeyL') {

      lighting = !lighting;

      if (lighting) {

          ambient.intensity = 0.25;
          scene.add(keyLight);
          scene.add(fillLight);
          scene.add(backLight);

      } else {

          ambient.intensity = 1.0;
          scene.remove(keyLight);
          scene.remove(fillLight);
          scene.remove(backLight);

      }

  }

}

function animate() {

  time += 10;
  sphere.rotation.x = time / 2000;
  sphere.rotation.y = time / 1000;
  
  if (sphere_direction_x == 1) {
    if (sphere.position.x + sphere_step < sphere_limit_right) {
      sphere.position.x += sphere_step;
    }
    else {
      sphere_direction_x = - 1;
    }
  }
  else {
    if (sphere.position.x - sphere_step > - sphere_limit_right) {
      sphere.position.x -= sphere_step;
    }
    else {
      sphere_direction_x = 1;
    }
  }

  if (sphere_direction_y == 1) {
    if (sphere.position.y + sphere_step < sphere_limit_top) {
      sphere.position.y += sphere_step;
    }
    else {
      sphere_direction_y = - 1;
    }
  }
  else {
    if( sphere.position.x - base_x < base_width / 2 && - ( sphere.position.x - base_x ) < base_width / 2 &&
      sphere.position.y - base_height < - sphere_limit_top + base_height ) {
        sphere_direction_y = 1;
    }
    else {
      if (sphere.position.y - sphere_step > - sphere_limit_top) {
        sphere.position.y -= sphere_step;
      }
      else {
        const base_height = 0.15;
        lost_games = lost_games + 1;
        console.log( lost_games );
        document.getElementById( 'score' ).innerHTML = 'lost games:' + lost_games;
        sphere.position.x = sphere.position.y = 0;
        sphere_direction_y = 1;
      }
    }
  }

  requestAnimationFrame(animate);
  controls.update();
  render();
}

function render() {

  renderer.render(scene, camera);

}