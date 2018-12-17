(function() {



    //------------------------------------------------------------------------
    const package_name = "umbriel";

    const icon_map = {
        "bed": "bed",
        "wtr": "tint",
        "net": "globe",
        "clo": "tshirt",
        "eat": "utensils",
        "pwr": "plug",
        "med": "prescription-bottle-alt",
        "ful": "gas-pump",
        "ven": "building",
        "sit": "exclamation",
        "obs": "hand-paper"
    }



    //------------------------------------------------------------------------
    /**
    * Display zoom and locate controls over the map interface
    */
    const setupControls = () => {
        // add zoom in & out control
        let zoom = L.control.zoom();
        zoom.setPosition("bottomright");
        zoom.addTo(LT.atlas.map);
        
        // create custom zoom icons
        let zoom_in = document.getElementsByClassName("leaflet-control-zoom-in")[0];
        let elem = document.createElement('span');
        elem.className = "fa fa-plus";
        zoom_in.innerHTML = "";
        zoom_in.appendChild(elem);
        let zoom_out = document.getElementsByClassName("leaflet-control-zoom-out")[0];
        let elem2 = document.createElement('span');
        elem2.className = "fa fa-minus";
        zoom_out.innerHTML = "";
        zoom_out.appendChild(elem2);

        // // add locate control
        L.control.locate(LC.leaflet_locatecontrol).addTo(LT.atlas.map);
    }


    const setupData = () =>{
        // make sure we have an organization to work with
        let org = new LX.Organization("lnt-dev", LT.db);
        LT.user.feed.refreshData();
        org.getOrRegister("Project Lantern Development Team")
            .then((res) => {
                if (res.name) {                
                    // make sure we have the demo package installed
                    let pkg = new LX.Package(package_name, org);
                    pkg.publish()
                        .then(() => {
                            LT.user.install(pkg);
                            LT.user.feed.refreshData();
                        })
                        .catch(err => {
                            console.error(err);
                        });
                }
            });
    }



    //------------------------------------------------------------------------
    // manage case where browser is set in background on ios/android
    let last_viewed = new Date().getTime();
    const checkForNewData = () => {
        let now = new Date().getTime();
        let diff = now - last_viewed;
        if (diff > 5000) {
            // more than 5 seconds
            LT.user.feed.refreshData();
        }
        last_viewed = now;
    }



    //------------------------------------------------------------------------
    let snapback = null;
    var self = {
        methods: {
            fitMap: () => {
                
                if (snapback) {
                    snapback=false;
                    return LT.atlas.setViewFromCenterLocationCache();
                }
                
                snapback = true; 
                LT.user.feed.refreshData();
                LT.atlas.cacheCenterLocation(1).then(() => {
                    LT.atlas.fitMapToAllMarkers();
                })

            }
        },
        computed: {
        },
        data: {
            "marker_count": 0
        },
        open: true,
        mounted() {
            // add map controls
            setupControls();



             // sync with all available markers from user-specific feed
            // this is pre-filtered based on installed packages
            LT.user.feed.on("update", (e) => {
                if (!e.data) {
                    // item was deleted
                    if (LT.atlas.markers[e.id]) {
                        LT.atlas.markers[e.id].hide();
                    }
                }
                else if (e.data.g && e.data.t) {
                    // duck typing for markers
                    // only add a new marker if we don't have it in atlas
                    if (LT.atlas.markers[e.id]) {
                        let old_marker = LT.atlas.markers[e.id];
                        old_marker.update(e.data)
                    }
                    else {
                        let marker = new LX.MarkerItem(e.id, e.data);
                        marker.show();
                        marker.setIcons(icon_map);                        
                    }
                }
            });


            setupData();

            // keep the UI up-to-date based on changes to marker count
            LT.atlas.on("marker-add", () => {
                this.marker_count = LT.atlas.getMarkerCount();
            });

            LT.atlas.on("marker-remove", () => {
                this.marker_count = LT.atlas.getMarkerCount();
            });



            // backup to handle cases where page is open but may be in background 
            // and therefore does not receive event updates through gundb emitters
            setInterval(checkForNewData, 500);


        }
    };

    return self;
}());