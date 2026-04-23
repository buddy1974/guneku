(function( $ ) {
	'use strict';

	/**
	 * Initialize the slick slider
	 *
	 * @since  4.1.0
	 */
	 function avs_init_slick( $this ) {
		$this.addClass( 'avs-slick-initialized' );

		var params = $this.data( 'params' );			
		var arrow_styles = 'top: ' + params.arrow_top_offset + '; width: ' + params.arrow_size  + '; height: ' + params.arrow_size + '; background: ' + params.arrow_bg_color + '; border-radius: ' + params.arrow_radius + '; font-size: ' + params.arrow_icon_size + '; color: ' + params.arrow_icon_color + '; line-height: ' + params.arrow_size + ';';
		
		// Slick			
		var $carousel = $this.slick({
			rtl: ( parseInt( params.is_rtl ) ? true : false ),
			prevArrow: '<div class="avs-slick-prev" style="left: ' + params.arrow_left_offset + '; ' + arrow_styles + '" role="button">&#10094;</div>',
			nextArrow: '<div class="avs-slick-next" style="right: ' + params.arrow_right_offset + '; ' + arrow_styles + '" role="button">&#10095;</div>',
			dotsClass: 'avs-slick-dots',
			customPaging: function( slider, i ) {					
				return '<div class="avs-slick-dot" style="color: ' + params.dot_color + '; font-size: ' + params.dot_size + '" role="button">&#9679;</div>';
			}
		});

		// Popup
		if ( $this.hasClass( 'avs-slick-popup' ) ) {
			var player_ratio = parseFloat( $( this ).data( 'player_ratio' ) );

			$carousel.magnificPopup({ 
				delegate: '.slick-slide:not(.slick-cloned) .avs-grid-item', // the selector for gallery item
				type: 'iframe',
				overflowY: 'auto',			
				removalDelay: 300,
				iframe: { // to create title, close, iframe, counter div's
				markup: '<div class="mfp-title-bar">' +
							'<div class="mfp-close" title="Close (Esc)"></div>' +
						'</div>' +							
						'<div class="mfp-iframe-scaler" style="padding-top:' + player_ratio + '%;" >' +            												
							'<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>' +																								
						'</div>'																							        			
				},	
				gallery: { // to build gallery				
					enabled: true													
				}									
			});	
		}
	}

	/**
	 * On Video Ended
	 *
	 * @since  4.2.0
	 */
	function on_video_ended( event ) {	
		if ( event.data.message == 'ON_ALLVIDEOSHARE_ENDED' ) {
			var id = event.data.id;
			var loop = event.data.loop;
	
			if ( id ) {
				var $playlistItems = $( '.avs-video', '#avs-playlist-' + id );
				var activeIndex = $( '.avs-video.avs-active', '#avs-playlist-' + id ).data( 'index' );
				
				var nextIndex = ++activeIndex;
				if ( $playlistItems.length == nextIndex ) {
					if ( loop ) {
						nextIndex = 0;
					} else {
						nextIndex = -1;
					}
				}

				if ( nextIndex > -1 ) {
					$( '.avs-video', '#avs-playlist-' + id ).eq( nextIndex ).trigger( 'click' );
				}
			}	
		}
	}

	/**
	 * Called when the page has loaded
	 *
	 * @since  4.1.0
	 */
	$(function() {
		// Magnific Popup 
		if ( $.fn.magnificPopup !== undefined ) {
			$( '.avs-popup' ).each(function() {	
				var player_ratio = parseFloat( $( this ).data( 'player_ratio' ) );

				$( this ).magnificPopup({ 
					delegate: '.avs-grid-item', // the selector for gallery item
					type: 'iframe',
					overflowY: 'auto',			
					removalDelay: 300,
					iframe: { // to create title, close, iframe, counter div's
					markup: '<div class="mfp-title-bar">' +
								'<div class="mfp-close" title="Close (Esc)"></div>' +
							'</div>' +							
							'<div class="mfp-iframe-scaler" style="padding-top:' + player_ratio + '%;" >' +            												
								'<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>' +																								
							'</div>'																							        			
					},	
					gallery: { // to build gallery				
						enabled: true													
					}									
				});	
			});
		};

		// Slider
		if ( $.fn.slick !== undefined ) {
			// Initialize the Slider
			$( '.avs-slick' ).each(function() {	
				var $this = $( this );					
				avs_init_slick( $this );
				
				// On before slide change
				var type = $this.data( 'type' );
				
				if ( 'player' == type ) {				
					$this.on( 'beforeChange', function( event, slick, current_slide, next_slide ) {								   
						$this.find( '.avs-player' ).html( '' );
						
						var $next_slide = $( slick.$slides[ next_slide ] );
						var src = $next_slide.find( '.avs-player' ).data( 'src' );
						$next_slide.find( '.avs-player' ).html( '<iframe src="' + src + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>' );					
					});				
				}										   
			});	
		};	

		// Playlist
		$( '.avs-video', '.avs-playlist' ).on( 'click', function( e ) {			
			var $container = $( this ).closest( '.avs-playlist' );

			var src = $( this ).data( 'src' );
			$container.find( 'iframe' ).attr( 'src', src );

			$container.find( '.avs-active' ).removeClass( 'avs-active' );
			$( this ).addClass( 'avs-active' );
		});

		window.addEventListener( 'message', on_video_ended, false );
		
		// Ratings
		$( 'body' ).on( 'click', '.avs-ratings-star a', function( e ) {
			e.preventDefault();
			
			var id = $( this ).data( 'id' ),
				rating = $( this ).data( 'value' );
		
			if ( avs.guest_ratings == 0 && avs.userid == 0 ) {
				alert( avs.message_login_required );
				return false;
			};

			document.getElementById( 'avs-ratings-widget' ).innerHTML = '<span class="avs-spinner"></span>';
			var xmlhttp;

			if ( window.XMLHttpRequest ) {
				xmlhttp = new XMLHttpRequest();
			} else {
				xmlhttp = new ActiveXObject( 'Microsoft.XMLHTTP' );
			};

			xmlhttp.onreadystatechange = function() {
				if ( xmlhttp.readyState == 4 && xmlhttp.status == 200 ) {
					if ( xmlhttp.responseText ) {		    
						document.getElementById( 'avs-ratings-widget' ).innerHTML = xmlhttp.responseText;
					};
				};
			};	

			xmlhttp.open( 'GET', avs.baseurl + 'index.php?option=com_allvideoshare&task=video.ratings&format=raw&id=' + id + '&rating=' + rating, true );
			xmlhttp.send();
				
			return false;			
		});

		// Likes & Dislikes
		$( 'body' ).on( 'click', '.avs-like-btn, .avs-dislike-btn', function( e ) {
			e.preventDefault();
			
			var id = $( this ).data( 'id' ),
				like = $( this ).data( 'like' ),
				dislike = $( this ).data( 'dislike' );
		
			if ( avs.guest_likes == 0 && avs.userid == 0 ) {
				alert( avs.message_login_required );
				return false;
			};

			document.getElementById( 'avs-likes-dislikes-widget' ).innerHTML = '<span class="avs-spinner"></span>';
			var xmlhttp;

			if ( window.XMLHttpRequest ) {
				xmlhttp = new XMLHttpRequest();
			} else {
				xmlhttp = new ActiveXObject( 'Microsoft.XMLHTTP' );
			};

			xmlhttp.onreadystatechange = function() {
				if ( xmlhttp.readyState == 4 && xmlhttp.status == 200 ) {
					if ( xmlhttp.responseText ) {	
						document.getElementById( 'avs-likes-dislikes-widget' ).innerHTML = xmlhttp.responseText;
					};
				};
			};	

			xmlhttp.open( 'GET', avs.baseurl + 'index.php?option=com_allvideoshare&view=video&task=video.likes&format=raw&id=' + id + '&like=' + like + '&dislike=' + dislike, true );
			xmlhttp.send();
				
			return false;			
		});		
	});

})( jQuery );