(function( $ ) {
	'use strict';

    window.avsFormdata = {};

    var defaults = {
        'type': '',
        'playlist': '',
        'channel': '',
        'username': '',
        'search': '',
        'order': 'relevance',
        'limit': '',
        'video': '',
        'videos': '',
        'cache': 0,
        'layout': 'classic',
        'columns': 3,
        'per_page': 12,
        'image_ratio': 56.25,
        'title': 1,
        'title_length': 0,
        'excerpt': 1,
        'excerpt_length': 75,
        'pagination': 1,
        'pagination_type': 'more',
        'arrows': 1,
        'arrow_size': 24,
        'arrow_bg_color': '#0088cc',
        'arrow_icon_color': '#ffffff',
        'arrow_radius': 12,
        'arrow_top_offset': 30,
        'arrow_left_offset': -25,
        'arrow_right_offset': -25,
        'dots': 1,
        'dot_size': 24,
        'dot_color': '#0088cc',
        'playlist_position': 'right',
        'playlist_color': 'dark',
        'playlist_width': 250,
        'playlist_height': 250,
        'player_ratio': 56.25,
        'player_title': 1,
        'player_description': 1,
        'autoplay': 0,
        'autoadvance': 0,
        'loop': 0,
        'controls': 1,
        'modestbranding': 1,
        'cc_load_policy': 0,
        'iv_load_policy': 0,
        'hl': '',
        'cc_lang_pref': ''
    };

    // Get Youtube playlist ID from Youtube URL
	function getPlaylistId( url ) {
		var id = /[&|\?]list=([a-zA-Z0-9_-]+)/gi.exec( url );
  		return ( id && id.length > 0 ) ? id[1] : url;		  
	}

    // Get Youtube channel ID from Youtube URL
	function getChannelId( url ) {
		var type = 'channel';
		var id = url;

		url = url.replace( /(>|<)/gi, '' ).split( /(\/channel\/|\/user\/)/ );

		if ( url[2] !== undefined ) {
			id = url[2].split( /[^0-9a-z_-]/i );
			id = id[0];
		}

		if ( /\/user\//.test( url ) ) { 
			type = 'username';
		}

		return {
			type: type,
			id: id
		};		  
	}

	// Get Youtube video ID from Youtube URL
	function getVideoId( url ) {
		var id = url;

		url = url.replace( /(>|<)/gi, '' ).split( /(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/ );

		if ( url[2] !== undefined ) {
		  id = url[2].split( /[^0-9a-z_\-]/i );
		  id = id[0];
		}

		return id;		  
	}

    window.avsInsertYouTubeGallery  = function( editor ) {      
        var formData = window.avsFormdata;

        // Attributes
		var props = {};

        for ( var pair of formData.entries() ) {
            var name  = pair[0];
            var value = pair[1];            

            // source = playlist
            if ( name == 'playlist' ) {
                value = getPlaylistId( value );
            }

            // source = channel
            if ( name == 'channel' ) {
                var result = getChannelId( value );                
                value = result.id;

                if ( props.hasOwnProperty( 'type' ) && props.type == 'channel' ) {
                    props.type = result.type;
                }
            }

            // source = video
            if ( name == 'video' ) {
                value = getVideoId( value );
            }

            // source = videos
            if ( name == 'videos' ) {
                var lines = value.split( '\n' ),
                    ids = [];

                lines.map(function( url ) {
                    ids.push( getVideoId( url ) );
                });
                
                value = ids.join( ',' );
            } 
            
            // Add only if the user input differ from the global configuration
            if ( value != defaults[ name ] ) {
                props[ name ] = value;
            }	
        }

        var attrs = '';

        for ( var key in props ) {
            if ( props.hasOwnProperty( key ) ) {
                attrs += ( ' ' + key + '="' + props[ key ] + '"' );
            }
        }

        var shortcode = '{avsyoutube' + attrs + '}';

        window.Joomla.editors.instances[ editor ].replaceSelection( shortcode );
        window.Joomla.Modal.getCurrent().close();

        return false;
    };

    /**
	 * Called when the page has loaded.
	 *
	 * @since 4.1.2
	 */
	$(function() {
        $( 'input, select, textarea', '#youtube-form' ).on( 'change', function() {
            window.parent.avsFormdata = new FormData( document.getElementById( 'youtube-form' ) );
        });
	});

})( jQuery );