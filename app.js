export function init(THREE, OrbitControls) {

  const container = document.querySelector("#container");

  // Create a scene
  const scene = new THREE.Scene();

  let cameraTarget = scene.position;

  // Create a camera
  const size = 5
  const aspect = window.innerWidth / window.innerHeight;
  const camera = new THREE.OrthographicCamera(-aspect * size, aspect * size, size, -size, 1, 1000);
    
  // Create a WebGLRenderer and add it to the DOM
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Create OrbitControls for rotating and zooming
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.rotateSpeed = 0.25;
  controls.zoomSpeed = 1.0;

  // Load textures (from https://www.solarsystemscope.com/textures/)
  const earthTexture = new THREE.TextureLoader().load("2k_earth_daymap.jpg");
  const moonTexture = new THREE.TextureLoader().load("2k_moon.jpg");
  const sunTexture = new THREE.TextureLoader().load("2k_sun.jpg");

  // Create Earth, Moon, and Sun models using sphere geometries
  const earthRadius = 1;
  const earthGeometry = new THREE.SphereGeometry(earthRadius, 32, 32);
  const earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture });
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  scene.add(earth);

  const moonRadius = 0.27; // Approx. 1/4th of Earth's radius
  const moonGeometry = new THREE.SphereGeometry(moonRadius, 32, 32);
  const moonMaterial = new THREE.MeshPhongMaterial({
    map: moonTexture,
    shininess: 2, // Lower value for less shiny appearance
    specular: new THREE.Color(0x333333), // Darker color for less intense specular highlights
  });
  const moon = new THREE.Mesh(moonGeometry, moonMaterial);
  moon.position.set(4, 0, 0); // Set an arbitrary position for now
  scene.add(moon);

  const sunRadius = 10 * earthRadius; // (Actually approx. 109 times Earth's radius)
  const sunGeometry = new THREE.SphereGeometry(sunRadius, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.position.set(-100, 0, 0); // Set an arbitrary position for now
  scene.add(sun);

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // color, intensity
  scene.add(ambientLight);

  // Add point light
  const pointLight = new THREE.PointLight(0xffffff, 1); // color, intensity
  pointLight.position.set(-100, 0, 0); // position the light near the Sun
  scene.add(pointLight);

  // Animate the scene
  function animate() {
    requestAnimationFrame(animate);

    // Update controls
    controls.update();

    camera.lookAt(cameraTarget);

    // Render the scene
    axesCamera.position.copy(camera.position);
    axesCamera.quaternion.copy(camera.quaternion);
    axesCamera.updateMatrixWorld();
    renderer.render(scene, camera);
    axesRenderer.render(axesScene, axesCamera);
  }

  const geocentricToggle = document.getElementById('geocentric-toggle');
  geocentricToggle.addEventListener('change', (event) => {
    updateCameraView(event.target.checked);
  });

  function updateCameraView(geocentricView) {
    if (geocentricView) {
      // Position the camera at the center of the Earth
      camera.position.set(0, 0, 0);

      // Set the camera target to the Moon's position
      cameraTarget = moon.position;

      // Magnify the scene relative to the default by increasing the camera's zoom property
      camera.zoom = 10;
    } else {
      // Set the camera position above the scene
      camera.position.set(0, 20, 0);

      // Set the camera target to the previous view
      cameraTarget = scene.position;

      // Reset the camera's zoom to the original value
      camera.zoom = 1;
    }

    // Update the camera projection matrix after changing the FOV
    camera.updateProjectionMatrix();
  }

  updateCameraView(false);

  const moonSlider = document.getElementById('moon-slider');
  moonSlider.addEventListener('input', (event) => {
    const angle = parseFloat(event.target.value);
    updateMoonPosition(angle);
  });

  function updateMoonPosition(angle) {
    const angleInRadians = THREE.MathUtils.degToRad(angle);
    const distanceFromEarth = 5; // You can adjust this value to change the distance between the Earth and the Moon

    moon.position.x = distanceFromEarth * Math.cos(angleInRadians);
    moon.position.z = - distanceFromEarth * Math.sin(angleInRadians);

    // Rotate the Moon on its Y-axis to always show the same face to Earth
    moon.rotation.y = angleInRadians + Math.PI;
  }

  updateMoonPosition(0);

  const infoButton = document.getElementById('info-button');
  const infoModal = document.getElementById('info-modal');
  const closeButton = document.getElementById('close-button');

  infoButton.addEventListener('click', () => {
    infoModal.style.display = 'block';
  });

  closeButton.addEventListener('click', () => {
    infoModal.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
    if (event.target === infoModal) {
      infoModal.style.display = 'none';
    }
  });

  const axesScene = new THREE.Scene();
  const axesCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
  axesCamera.position.set(0, 0, 5);
  axesCamera.lookAt(axesScene.position);

  const axesRenderer = new THREE.WebGLRenderer({ alpha: true });
  axesRenderer.setSize(window.innerWidth / 5, window.innerHeight / 5);
  axesRenderer.setClearColor(0x000000, 0);
  document.body.appendChild(axesRenderer.domElement);
  axesRenderer.domElement.style.position = 'fixed';
  axesRenderer.domElement.style.bottom = '10px';
  axesRenderer.domElement.style.right = '10px';

  const axesHelper = new THREE.AxesHelper(4);
  axesScene.add(axesHelper);

  animate();

  // Handle window resize
  window.addEventListener("resize", () => {
    if (container) {  
      const newAspect = container.clientWidth / container.clientHeight;
      camera.left = size * newAspect / -2;
      camera.right = size * newAspect / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }
  });

}
