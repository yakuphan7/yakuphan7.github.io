

function WP3D(model, options) {

	var self = this;

	self.lastRendered = Date.now();
	self.dirty = false;

	self.setDirty = function() {
		self.dirty = true;
	}


	self.init = function(model, options) {
	    self.stage = document.getElementById(options.id);  
	    
	    width = 0;
	    pWidth = options.width;
	    if (pWidth.indexOf('%')==pWidth.length-1) {
	        width = self.stage.offsetWidth * parseInt(pWidth) / 100;
	    } else {
	        width = parseInt(pWidth);
	    }
	
	    height = 0;
	    pHeight = options.height;
	    if (pHeight.indexOf('%')==pHeight.length-1) {
	    	height = self.stage.offsetHeight * parseInt(pHeight) / 100;
	    } else {
	    	height = parseInt(pHeight);
	    }
	    
	    self.scene = new THREE.Scene();
	    self.camera = new THREE.PerspectiveCamera( options.fov, width / height, 0.1, 1000 );
	    self.camera.position.x = options.camera[0];
	    self.camera.position.y = options.camera[1];
	    self.camera.position.z = options.camera[2];
		
		self.renderer = new THREE.WebGLRenderer({ alpha: true });
		self.renderer.setSize( width, height );
		self.renderer.setClearColor( options.background, options.opacity);
		self.stage.appendChild( self.renderer.domElement );	 
	
		var directionalLight = new THREE.DirectionalLight( options.directionalColor, 1 );
		directionalLight.position.set( options.directionalPosition[0], options.directionalPosition[1], options.directionalPosition[2] );
		self.scene.add( directionalLight );
			
		var light = new THREE.AmbientLight( options.ambient ); // soft white light
		self.scene.add( light );
		
		controls = new THREE.OrbitControls( self.camera, self.stage );
		controls.damping = 0.2;
		controls.addEventListener( 'change', self.setDirty.bind(self) );
		
		if (self.endsWith(model, '.dae'))
			self.loadDAE(model, options);
		else if (self.endsWith(model, '.obj'))
			self.loadOBJ(model, options);
		else if (self.endsWith(model, '.objmtl'))
			self.loadOBJMTL(model, options);
		
	}

	self.endsWith = function(str, suffix) {
	    return str.toLowerCase().indexOf(suffix.toLowerCase(), str.length - suffix.length) !== -1;
	}
	
	self.progress = function(event) {
		loaded = event.loaded;
		total = event.total;
		console.log(loaded + " of "+total);
	}
	
	self.failure = function() {
		self.stage.innerHTML = 'Could not load model.';
		console.log('Could not load model.');
	}
	
	self.loadDAE = function(model, options) {
		console.log('loading DAE: ' + model);
		var loader = new THREE.ColladaLoader();
		loader.options.convertUpAxis = true;
		var loadScene = self.scene;
		loader.load(model, function ( collada ) {
		  var dae = collada.scene;
		  var skin = collada.skins[ 0 ];
		  dae.position.set(options.modelPosition[0],options.modelPosition[1],options.modelPosition[2]);//x,z,y- if you think in blender dimensions ;)
		  dae.scale.set(options.modelScale[0],options.modelScale[1],options.modelScale[2]);
	
		  loadScene.add(dae);
		  self.dirty = true;
		  console.log('object loaded');
		}, self.progress, self.failure);
	}

	self.loadOBJ = function(model, options) {
		console.log('loading OBJ: ' + model);

		onload = function ( object ) {
			object.position.set(options.modelPosition[0],options.modelPosition[1],options.modelPosition[2]);//x,z,y- if you think in blender dimensions ;)
			object.scale.set(options.modelScale[0],options.modelScale[1],options.modelScale[2]);
			loadScene.add( object );
			self.dirty = true;
			console.log('object loaded');
		}

		var loadScene = self.scene;
		if (options.material) {
			var loader = new THREE.OBJMTLLoader();
			loader.load( model, options.material, onload, self.progress, self.failure);
		} else {
			var loader = new THREE.OBJLoader();
			loader.load( model, onload, self.progress, self.failure);
		}

	}

	self.loadOBJMTL = function(model, options) {
		var loader = new THREE.OBJMTLLoader();
		mtl = model.substring(0, model.length-6) + 'mtl';
		console.log('loading OBJMTL:' + model + ", " + mtl);
		var loadScene = self.scene;
		loader.load( model, mtl, function ( object ) {
			object.position.set(options.modelPosition[0],options.modelPosition[1],options.modelPosition[2]);//x,z,y- if you think in blender dimensions ;)
			object.scale.set(options.modelScale[0],options.modelScale[1],options.modelScale[2]);
			loadScene.add( object );
			self.dirty = true;
			console.log('object loaded');
		}, self.progress, self.failure);
	}
	
	self.render = function() {
		requestAnimationFrame( self.render.bind(self) );

	    delta = Date.now() - self.lastRendered;
	    if (self.dirty && delta > 1000/options.fps) {
	    	self.renderer.render( self.scene, self.camera );
	    	self.lastRendered = Date.now();
	    	self.dirty = false;
	    }
	}
	
	self.init(model, options);
}

