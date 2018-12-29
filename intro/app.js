(function() {



    //------------------------------------------------------------------------
	const startMapApplications = function() {
		LT.closeOneApp("intro");
		this.show = false;
	
		setTimeout(() => {
			LT.openOneApp("mapify");
			LT.openOneApp("radiant");
		}, 50);
	}



    //------------------------------------------------------------------------
	var config = {
		methods: {},
		computed: {},
		data: {
			"title": "",
			"slide": 0,
			"max_slide": 3,
			"show": false
		},
		callback: function() {
		},
		mounted() {
			if (localStorage.hasOwnProperty("lx-app-intro-skip")) {
				// we saved a map position, therefore must be a return user...
				startMapApplications.call(this);
			}
			else {
				this.title = "Lantern Network";
				this.show = true;
			}
		},
		open: true
	};



    //------------------------------------------------------------------------
	config.methods.doComplete = function() {
		startMapApplications.call(this);
	}

	config.methods.doContinue = function() {
		this.$data.slide++;
		if (this.$data.slide > this.$data.max_slide) {

			// did user get to the end of our onboarding? if so, don't bother again...
			localStorage.setItem("lx-app-intro-skip", true);
			config.methods.doComplete.call(this);
		}
	}

	return config;
}());