(function( $ ) {
	'use strict';	

	// Vars
	var onGalleryReady = false;

	/**
	 * Init Gallery. Called when YouTube API is ready.
	 *
	 * @since 4.1.2
	 */
	function initGallery() {
		if ( onGalleryReady ) {
			return false;
		}

		onGalleryReady = true;

		// Single Video
		$( '.avs-youtube-layout-single' ).each(function() {
			initSingleVideoLayout( $( this ) );
		});

		// Live Stream
		$( '.avs-youtube-layout-livestream' ).each(function() {
			initLiveStreamLayout( $( this ) );
		});

		// Classic Layout
		$( '.avs-youtube-layout-classic' ).each(function() {
			initClassicLayout( $( this ) );
		});
		
		// Inline Layout
		$( '.avs-youtube-layout-inline' ).each(function() {
			initInlineLayout( $( this ) );
		});			

		// Popup Layout
		if ( $.fn.magnificPopup !== undefined ) {
			$( '.avs-youtube-layout-popup' ).each(function() {
				initPopupLayout( $( this ) );
			});	
		}

		// Playlist Layout
		$( '.avs-youtube-layout-playlist' ).each(function() {
			initPlaylistLayout( $( this ) );
		});	

		// Slider Layout
		if ( $.fn.slick !== undefined ) {
			$( '.avs-youtube-layout-slider' ).each(function() {
				initSliderLayout( $( this ) );
			});	
		}
	}

	/**
	 * Init SingleVideo Layout.
	 *
	 * @since 4.2.0
	 */
	function initSingleVideoLayout( $container ) {
		var params = resolveLayoutOptions( $container.data( 'params' ) );	

		// Player
		var player = new YT.Player( 'avs-player-' + params.uid, {
			events: {
				'onStateChange': function( e ) {
					if ( e.data == YT.PlayerState.ENDED ) {
						if ( params.loop ) {
							player.playVideo();
						}
					}
				}				
			}
		});		
	}

	/**
	 * Init LiveStream Layout.
	 *
	 * @since 4.1.2
	 */
	function initLiveStreamLayout( $container ) {
		var params = resolveLayoutOptions( $container.data( 'params' ) );	

		// Player
		var player = new YT.Player( 'avs-player-' + params.uid, {
			events: {
				'onReady': function( e ) {
					var url = e.target.getVideoUrl();

					if ( url == 'https://www.youtube.com/watch?v=live_stream' ) {
						$container.find( '.avs-youtube-player' ).fadeOut( 'fast', function() {
							$container.find( '.avs-youtube-fallback-message' ).fadeIn();
						});															
					} else {
						$container.find( 'iframe' ).show();
					}
				}
			}
		});		
	}

	/**
	 * Init Classic Layout.
	 *
	 * @since 4.1.2
	 */
	function initClassicLayout( $container ) {
		var params = resolveLayoutOptions( $container.data( 'params' ) );	

		var $currentItem = $container.find( '.avs-video.avs-active' );
		var currentVideoId = $currentItem.data( 'id' );	

		var $pagination = $container.find( '.avs-youtube-pagination' );
		var $nextButton = null;
		var paginationType = 'none';
		if ( $pagination.length > 0 ) { 
			if ( $pagination.hasClass( 'avs-youtube-pagination-type-pager' ) ) {
				paginationType = 'pager';
			} else {
				paginationType = 'more';
			}

			$nextButton = $pagination.find( '.avs-youtube-pagination-link-next' );
		}		

		// Player
		var player = new YT.Player( 'avs-player-' + params.uid, {
			events: {
				'onStateChange': function( e ) {
					if ( e.data == YT.PlayerState.ENDED ) {
						if ( params.autoadvance ) {
							if ( $currentItem.is( ':visible' ) ) {
								if ( $currentItem.is( ':last-child' ) ) {
									if ( paginationType == 'more' || paginationType == 'none' ) {
										if ( params.loop ) {
											$container.find( '.avs-video' ).eq(0).trigger( 'click' );
										}
									} else {
										// Load Next Page
										if ( ! $nextButton.closest( 'li' ).hasClass( 'disabled' ) ) {					
											$nextButton.trigger( 'click' );

											var __interval = setInterval(
												function() {												
													if ( 0 == $container.find( '.avs-youtube-pagination.avs-loading' ).length ) {
														clearInterval( __interval );
														$container.find( '.avs-video' ).eq(0).trigger( 'click' );
													}												
												}, 
												1000
											);									
										}
									}
								} else {
									$currentItem.next( '.avs-video' ).trigger( 'click' );
								}
							} else {
								$container.find( '.avs-video' ).eq(0).trigger( 'click' );
							}
						} else {
							if ( params.loop ) {
								player.playVideo();
							}
						}
					}				 
				}
			}
		});

		// Grid: On Thumbnail Clicked
		$container.on( 'click', '.avs-video', function( e ) {
			e.preventDefault();

			if ( ! player.loadVideoById ) {
				return false;
			}			
			
			$currentItem = $( this );

			$container.find( '.avs-active' ).removeClass( 'avs-active' );			
			$currentItem.addClass( 'avs-active' );

			// Change Video
			currentVideoId = $currentItem.data( 'id' );
			player.loadVideoById( currentVideoId );	

			if ( params.player_title ) {
				var title = $currentItem.data( 'title' );
				$container.find( '.avs-player-title' ).html( title );
			}

			if ( params.player_description ) {
				var description = $currentItem.find( '.avs-description' ).html();
				$container.find( '.avs-player-description' ).html( description );
			}
			
			// Scroll to Top
			$( 'html, body' ).animate({
				scrollTop: $container.offset().top - 75
			}, 100);

			// Load Next Page
			if ( params.autoadvance && paginationType == 'more' ) {				
				if ( $currentItem.is( ':last-child' ) && $nextButton.is( ':visible' ) && ! $nextButton.closest( 'li' ).hasClass( 'disabled' ) ) {
					$nextButton.trigger( 'click' );
				}
			}
		});

		// Pagination
		if ( $pagination.length > 0 ) {
			initPagination( $pagination );

			$pagination.on( 'gallery.updated', function() {
				if ( $container.find( '.avs-active' ).length > 0 ) {
					return;
				}

				if ( $container.find( '.avs-video-' + currentVideoId ).length > 0 ) {
					$currentItem = $container.find( '.avs-video-' + currentVideoId ).addClass( 'avs-active' );
				}
			});
		}
	}

	/**
	 * Init Inline Layout.
	 *
	 * @since 4.1.2
	 */
	 function initInlineLayout( $container ) {
		var params = resolveLayoutOptions( $container.data( 'params' ) );	

		var $currentItem = $container.find( '.avs-video.avs-active' );
		var player = null;		

		var $pagination = $container.find( '.avs-youtube-pagination' );
		var $nextButton = null;
		var paginationType = 'none';
		if ( $pagination.length > 0 ) { 
			if ( $pagination.hasClass( 'avs-youtube-pagination-type-pager' ) ) {
				paginationType = 'pager';
			} else {
				paginationType = 'more';
			}

			$nextButton = $pagination.find( '.avs-youtube-pagination-link-next' );
		}

		// Grid: On Thumbnail Clicked
		$container.on( 'click', '.avs-video', function( e ) {
			e.preventDefault();			
			
			// Dispose the current player
			if ( player ) {
				if ( player.stopVideo ) {
					player.stopVideo();
				}

				if ( player.destroy ) {
					player.destroy();
				}

				player = null;
			}

			// Set this item as active
			$currentItem = $( this );

			$container.find( '.avs-active' ).removeClass( 'avs-active' );			
			$currentItem.addClass( 'avs-active' );

			// Change Video
			var src = $currentItem.data( 'src' );

			var iframe = '<iframe id="avs-player-' + params.uid + '" width="100%" height="100%" src="' + src + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
			$currentItem.find( '.avs-responsive-item' ).append( iframe );

			player = new YT.Player( 'avs-player-' + params.uid, {
				events: {
					'onStateChange': function( e ) {
						if ( e.data == YT.PlayerState.ENDED ) {							
							if ( params.autoadvance ) {
								if ( $currentItem.is( ':last-child' ) ) {
									if ( paginationType == 'more' || paginationType == 'none' ) {
										if ( params.loop ) {
											$container.find( '.avs-video' ).eq(0).trigger( 'click' );
										}
									} else {
										// Load Next Page
										if ( ! $nextButton.closest( 'li' ).hasClass( 'disabled' ) ) {					
											$nextButton.trigger( 'click' );

											var __interval = setInterval(
												function() {												
													if ( 0 == $container.find( '.avs-youtube-pagination.avs-loading' ).length ) {
														clearInterval( __interval );
														$container.find( '.avs-video' ).eq(0).trigger( 'click' );
													}												
												}, 
												1000
											);									
										}
									}
								} else {
									$currentItem.next( '.avs-video' ).trigger( 'click' );
								}
							} else {
								if ( params.loop ) {
									player.playVideo();
								}
							}
						}				 
					}
				}
			});

			// Load Next Page
			if ( params.autoadvance && paginationType == 'more' ) {
				if ( $currentItem.is( ':last-child' ) && $nextButton.is( ':visible' ) && ! $nextButton.closest( 'li' ).hasClass( 'disabled' ) ) {
					$nextButton.trigger( 'click' );
				}
			}
		});

		// Pagination
		if ( $pagination.length > 0 ) {
			initPagination( $pagination );
		}
	}		

	/**
	 * Init Popup Layout.
	 *
	 * @since 4.1.2
	 */
	function initPopupLayout( $container ) {
		var params = resolveLayoutOptions( $container.data( 'params' ) );

		var player = null;
		var magnificPopup = null;		
		var currentIndex = 0;
		var $currentItem = null;
		var totalVideos = $container.find( '.avs-video' ).length;

		var $pagination = $container.find( '.avs-youtube-pagination' );
		var $nextButton = null;
		var paginationType = 'none';
		if ( $pagination.length > 0 ) { 
			if ( $pagination.hasClass( 'avs-youtube-pagination-type-pager' ) ) {
				paginationType = 'pager';
			} else {
				paginationType = 'more';
			}

			$nextButton = $pagination.find( '.avs-youtube-pagination-link-next' );
		}

		var onVideoChanged = function( index ) {
			if ( ! player.loadVideoById ) {
				return false;
			}	

			$currentItem = $container.find( '.avs-video' ).eq( index );

			// Change Video
			var id = $currentItem.data( 'id' );
			player.loadVideoById( id );	

			if ( params.player_title ) {
				var title = $currentItem.data( 'title' );
				magnificPopup.contentContainer.find( '.mfp-title' ).html( title );	
			}

			if ( params.player_description ) {
				var description = $currentItem.find( '.avs-description' ).html();
				magnificPopup.contentContainer.find( '.mfp-description' ).html( description );
			}

			// Load Next Page
			loadNextPage();
		}
		
		var loadNextPage = function() {
			if ( params.autoadvance && paginationType == 'more' ) {
				if ( $currentItem.is( ':last-child' ) && $nextButton.is( ':visible' ) && ! $nextButton.closest( 'li' ).hasClass( 'disabled' ) ) {
					$nextButton.trigger( 'click' );
				}
			}
		}

		// Initialize Magnific Popup
		var iframeMarkup = '<div class="mfp-title-bar">' +
			'<div class="mfp-close" title="Close (Esc)"></div>' +
		'</div>' +							
		'<div class="mfp-iframe-scaler" style="padding-top:' + params.player_ratio + '%;" >' +            												
			'<iframe id="avs-player-' + params.uid + '" class="mfp-iframe" frameborder="0" scrolling="no" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>' +																								
		'</div>';

		if ( params.player_title || params.player_description ) {
			iframeMarkup += '<div class="mfp-bottom-bar">' + 
				'<div class="avs-player-caption">' + 
					'<h2 class="mfp-title"></h2>' + 
					'<div class="mfp-description avs-description avs-player-description"></div>' +
				'</div>' + 
			'</div>';
		}

		$container.magnificPopup({ 
			delegate: '.avs-video', // The selector for gallery item
			type: 'iframe',
			closeOnBgClick: false,
			mainClass: 'avs-youtube-popup-wrapper',
			iframe: { // To create title, close, iframe, counter div's
				markup: iframeMarkup																							        			
			},
			callbacks: { // To assign src, title, description								
				markupParse: function( template, values, item ) {	
					if ( params.player_title ) {					
						values.title = item.el.attr( 'data-title' );	
					}

					if ( params.player_description ) {
						values.description = item.el.find( '.avs-description' ).html();	
					}					
				},
				open: function() {
					magnificPopup = $.magnificPopup.instance;					
					currentIndex  = magnificPopup.index;
					$currentItem  = $container.find( '.avs-video' ).eq( currentIndex );
					
					player = new YT.Player( 'avs-player-' + params.uid, {
						events: {
							'onStateChange': function( e ) {
								if ( e.data == YT.PlayerState.ENDED ) {
									if ( params.autoadvance ) {
										if ( $currentItem.is( ':last-child' ) ) {
											if ( paginationType == 'more' || paginationType == 'none' ) {
												if ( params.loop ) {
													magnificPopup.next();
												}
											} else {
												// Load Next Page
												if ( ! $nextButton.closest( 'li' ).hasClass( 'disabled' ) ) {					
													$nextButton.trigger( 'click' );
		
													var __interval = setInterval(
														function() {												
															if ( 0 == $container.find( '.avs-youtube-pagination.avs-loading' ).length ) {
																clearInterval( __interval );
																
																currentIndex = 0;												
																onVideoChanged( currentIndex );
															}												
														}, 
														1000
													);									
												}
											}
										} else {
											magnificPopup.next();
										}
									} else {
										if ( params.loop ) {
											player.playVideo();
										}
									}
								}				 
							}
						}
					});

					$.magnificPopup.instance.next = function() {			
						currentIndex++;
						totalVideos = $container.find( '.avs-video' ).length;
			
						if ( currentIndex > totalVideos ) {
							currentIndex = 0;
						}			
			
						onVideoChanged( currentIndex );
					};
			
					$.magnificPopup.instance.prev = function() {			
						currentIndex--;
			
						if ( currentIndex < 0 ) {
							currentIndex = totalVideos;
						}
			
						onVideoChanged( currentIndex );
					};

					// Load Next Page
					loadNextPage();
				}																						
			},	
			gallery: { // To build gallery				
				enabled: true													
			}									
		});
		
		// Pagination
		if ( $pagination.length > 0 ) {
			initPagination( $pagination );
		}
	}

	/**
	 * Init Playlist Layout.
	 *
	 * @since 4.1.2
	 */
	function initPlaylistLayout( $container ) {
		var params = resolveLayoutOptions( $container.data( 'params' ) );	

		var $currentItem = $container.find( '.avs-video.avs-active' );

		// Player
		var player = new YT.Player( 'avs-player-' + params.uid, {
			events: {
				'onStateChange': function( e ) {
					if ( e.data == YT.PlayerState.ENDED ) {
						if ( params.autoadvance ) {
							if ( $currentItem.is( ':last-child' ) ) {
								if ( params.loop ) {
									$container.find( '.avs-video' ).eq(0).trigger( 'click' );
								}
							} else {
								$currentItem.next( '.avs-video' ).trigger( 'click' );
							}
						} else {
							if ( params.loop ) {
								player.playVideo();
							}
						}
					}				 
				}
			}
		});

		// Playlist: On Thumbnail Clicked
		$container.on( 'click', '.avs-video', function( e ) {
			e.preventDefault();		
			
			if ( ! player.loadVideoById ) {
				return false;
			}	
			
			$currentItem = $( this );

			$container.find( '.avs-active' ).removeClass( 'avs-active' );			
			$currentItem.addClass( 'avs-active' );

			// Change Video
			var id = $currentItem.data( 'id' );
			player.loadVideoById( id );	

			if ( params.player_title ) {
				var title = $currentItem.data( 'title' );
				$container.find( '.avs-player-title' ).html( title );
			}

			if ( params.player_description ) {
				var description = $currentItem.find( '.avs-description' ).html();
				$container.find( '.avs-player-description' ).html( description );
			}
		});
	}

	/**
	 * Init Slider Layout.
	 *
	 * @since 4.1.2
	 */
	function initSliderLayout( $container ) {
		var params = resolveLayoutOptions( $container.data( 'params' ) );

		var arrow_styles = 'top: ' + params.arrow_top_offset + '; width: ' + params.arrow_size  + '; height: ' + params.arrow_size + '; background: ' + params.arrow_bg_color + '; border-radius: ' + params.arrow_radius + '; font-size: ' + params.arrow_icon_size + '; color: ' + params.arrow_icon_color + '; line-height: ' + params.arrow_size + ';';
		var $gallery = $container.find( '.avs-videos' );
		var $currentItem = null;

		// Player
		var player = new YT.Player( 'avs-player-' + params.uid, {
			events: {
				'onStateChange': function( e ) {
					if ( e.data == YT.PlayerState.ENDED ) {
						if ( params.autoadvance ) {
							if ( $currentItem.is( ':last-child' ) ) {
								if ( params.loop ) {
									$container.find( '.slick-slide' ).eq(0).trigger( 'click' );
								}
							} else {
								$currentItem.next( '.slick-slide' ).trigger( 'click' );
							}
						} else {
							if ( params.loop ) {
								player.playVideo();
							}
						}
					}				 
				}
			}
		});

		// Grid: On Thumbnail Clicked
		$container.on( 'click', '.slick-slide', function( e ) {
			e.preventDefault();		

			if ( ! player.loadVideoById ) {
				return false;
			}		
			
			$currentItem = $( this );

			$container.find( '.avs-active' ).removeClass( 'avs-active' );			
			$currentItem.addClass( 'avs-active' );

			// Change Video
			var id = $currentItem.find( '.avs-video' ).data( 'id' );
			player.loadVideoById( id );	

			if ( params.player_title ) {
				var title = $currentItem.find( '.avs-video' ).data( 'title' );
				$container.find( '.avs-player-title' ).html( title );
			}

			if ( params.player_description ) {
				var description = $currentItem.find( '.avs-description' ).html();
				$container.find( '.avs-player-description' ).html( description );
			}

			// Update Slider Position
			var index = $currentItem.data( 'slick-index' );
			$gallery.slick( 'slickGoTo', index );

			// Scroll to Top
			$( 'html, body' ).animate({
				scrollTop: $container.offset().top - 75
			}, 100);			
		});			
		
		// Initialize Slick
		$gallery.on( 'init', function( event, slick ) {
			$currentItem = $container.find( '.slick-slide.slick-current' ).addClass( 'avs-active' );
		}).slick({
			rtl: ( parseInt( params.is_rtl ) ? true : false ),
			prevArrow: '<div class="avs-slick-prev" style="left: ' + params.arrow_left_offset + '; ' + arrow_styles + '" role="button">&#10094;</div>',
			nextArrow: '<div class="avs-slick-next" style="right: ' + params.arrow_right_offset + '; ' + arrow_styles + '" role="button">&#10095;</div>',
			dotsClass: 'avs-slick-dots',
			customPaging: function( slider, i ) {					
				return '<div class="avs-slick-dot" style="color: ' + params.dot_color + '; font-size: ' + params.dot_size + '" role="button">&#9679;</div>';
			}
		});
	}

	/**
	 * Init Pagination.
	 *
	 * @since 4.1.2
	 */
	function initPagination( $pagination ) {
		var params = $pagination.data( 'params' );	

		var ajaxUrl  = avs.youtube.baseurl + 'index.php?option=com_allvideoshare&task=youtubeAjax&format=raw';
		var $gallery = $pagination.closest( '.avs-youtube' ).find( '.avs-videos' );

		var totalPages = parseInt( params.total_pages );
		var paged = 1;
		var previousPageTokens = [''];

		// On next/more button clicked
		$pagination.find( '.avs-youtube-pagination-link-next' ).on( 'click', function( e ) {
			e.preventDefault();
			var $this = $( this );

			$pagination.addClass( 'avs-loading' );			
				
			var type = $this.data( 'type' );
			
			params.pageToken = params.next_page_token;
			previousPageTokens[ paged ] = params.next_page_token;

			$.post( ajaxUrl, params, function( response ) {
				response = JSON.parse( response );
				
				if ( response.success ) {
					paged = Math.min( paged + 1, totalPages );

					params.next_page_token = '';
					if ( paged < totalPages && response.data.next_page_token ) {
						params.next_page_token = response.data.next_page_token;
					}

					var html = $( response.data.html ).find( '.avs-videos' ).html();					

					switch ( type ) {
						case 'next':			
							if ( '' == params.next_page_token ) {
								$pagination.find( '.avs-page-item-next' ).addClass( 'disabled' );
							}

							$pagination.find( '.avs-page-item-previous' ).removeClass( 'disabled' );
							$pagination.find( '.avs-page-info-current' ).html( paged );			

							$gallery.html( html );
							break;
						case 'more':							
							if ( '' == params.next_page_token ) {
								$this.hide();
							}
					
							$gallery.append( html );
							break;
					}

					$pagination.trigger( 'gallery.updated' );
				} else {
					console.log( response.message );
				}

				$pagination.removeClass( 'avs-loading' );
			});
		});

		// On previous button clicked
		$pagination.find( '.avs-youtube-pagination-link-previous' ).on( 'click', function( e ) {
			e.preventDefault();
			var $this = $( this );

			$pagination.addClass( 'avs-loading' );			
				
			paged = Math.max( paged - 1, 1 );
			params.pageToken = previousPageTokens[ paged - 1 ];

			$.post( ajaxUrl, params, function( response ) {
				response = JSON.parse( response );
				
				if ( response.success ) {
					params.next_page_token = '';
					if ( response.data.next_page_token ) {
						params.next_page_token = response.data.next_page_token;
					}

					var html = $( response.data.html ).find( '.avs-videos' ).html();	
					$gallery.html( html );				

					$pagination.find( '.avs-page-item-next' ).removeClass( 'disabled' );
					$pagination.find( '.avs-page-info-current' ).html( paged );

					if ( 1 == paged ) {
						$pagination.find( '.avs-page-item-previous' ).addClass( 'disabled' );
					}
					
					$pagination.trigger( 'gallery.updated' );
				} else {
					console.log( response.message );
				}

				$pagination.removeClass( 'avs-loading' );
			});
		});
	}

	/**
	 * Resolve Layout Options.
	 *
	 * @since 4.1.2
	 */
	function resolveLayoutOptions( params ) {
		var options = {};

		if ( params.hasOwnProperty( 'uid' ) ) {
			options.uid = params.uid;
		}

		if ( params.hasOwnProperty( 'is_rtl' ) ) {
			options.is_rtl = parseInt( params.is_rtl );
		}

		if ( params.hasOwnProperty( 'player_ratio' ) ) {
			options.player_ratio = parseFloat( params.player_ratio );
		}
		
		if ( params.hasOwnProperty( 'autoplay' ) ) {
			options.autoplay = parseInt( params.autoplay );
		}

		if ( params.hasOwnProperty( 'autoadvance' ) ) {
			options.autoadvance = parseInt( params.autoadvance );
		}

		if ( params.hasOwnProperty( 'loop' ) ) {
			options.loop = parseInt( params.loop );
		}

		if ( params.hasOwnProperty( 'controls' ) ) {
			options.controls = parseInt( params.controls );
		}

		if ( params.hasOwnProperty( 'modestbranding' ) ) {
			options.modestbranding = parseInt( params.modestbranding );
		}
	
		if ( params.hasOwnProperty( 'cc_load_policy' ) ) {
			options.cc_load_policy = parseInt( params.cc_load_policy );
		}
	
		if ( params.hasOwnProperty( 'iv_load_policy' ) ) {
			options.iv_load_policy = parseInt( params.iv_load_policy );
		}
	
		if ( params.hasOwnProperty( 'hl' ) ) {
			options.hl = params.hl;
		}
	
		if ( params.hasOwnProperty( 'cc_lang_pref' ) ) {
			options.cc_lang_pref = params.cc_lang_pref;
		}

		if ( params.hasOwnProperty( 'player_title' ) ) {
			options.player_title = parseInt( params.player_title );
		}

		if ( params.hasOwnProperty( 'player_description' ) ) {
			options.player_description = parseInt( params.player_description );
		}

		if ( params.hasOwnProperty( 'arrow_size' ) ) {
			options.arrow_size = params.arrow_size;
		}

		if ( params.hasOwnProperty( 'arrow_bg_color' ) ) {
			options.arrow_bg_color = params.arrow_bg_color;
		}

		if ( params.hasOwnProperty( 'arrow_icon_size' ) ) {
			options.arrow_icon_size = params.arrow_icon_size;
		}

		if ( params.hasOwnProperty( 'arrow_icon_color' ) ) {
			options.arrow_icon_color = params.arrow_icon_color;
		}

		if ( params.hasOwnProperty( 'arrow_radius' ) ) {
			options.arrow_radius = params.arrow_radius;
		}

		if ( params.hasOwnProperty( 'arrow_top_offset' ) ) {
			options.arrow_top_offset = params.arrow_top_offset;
		}

		if ( params.hasOwnProperty( 'arrow_left_offset' ) ) {
			options.arrow_left_offset = params.arrow_left_offset;
		}

		if ( params.hasOwnProperty( 'arrow_right_offset' ) ) {
			options.arrow_right_offset = params.arrow_right_offset;
		}

		if ( params.hasOwnProperty( 'dot_size' ) ) {
			options.dot_size = params.dot_size;
		}

		if ( params.hasOwnProperty( 'dot_color' ) ) {
			options.dot_color = params.dot_color;
		}

		return options;
	}

	/**
	 * Called when the page has loaded.
	 *
	 * @since 4.1.2
	 */
	$(function() {
		// Init Gallery
		if ( 'undefined' === typeof window['YT'] ) {
			var tag = document.createElement( 'script' );
			tag.src = "https://www.youtube.com/iframe_api";
			var firstScriptTag = document.getElementsByTagName( 'script' )[0];
			firstScriptTag.parentNode.insertBefore( tag, firstScriptTag );		
		}
		
		if ( 'undefined' == typeof window.onYouTubeIframeAPIReady ) {
			window.onYouTubeIframeAPIReady = function() {
				initGallery();
			};
		} else if ( 'undefined' !== typeof window.YT ) {
			initGallery();
		}
		
		var interval = setInterval(
			function() {
				if ( 'undefined' !== typeof window.YT && window.YT.loaded )	{
					clearInterval( interval );
					initGallery();					
				}
			}, 
			10
		);

		// Popup: close on background click
		$( document ).on( 'click', '.avs-youtube-popup-wrapper', function() {
			$.magnificPopup.close();
		});

		// Popup: Enable click event on child elements
		$( document ).on( 'click', '.avs-youtube-popup-wrapper a, .avs-youtube-popup-wrapper button', function( event ) {
			event.stopPropagation();            
		});

		// Toggle more/less content in the video description
		$( document ).on( 'click', '.avs-description-toggle-btn', function( e ) {
			e.preventDefault();

			var $button = $( this );
			var $description = $button.closest( '.avs-description' );
			var $dots = $description.find( '.avs-description-dots' );
			var $more = $description.find( '.avs-description-more' );

			if ( $dots.is( ':visible' ) ) {
				$button.html( '[-] ' + avs.youtube.i18n.show_less );
				$dots.hide();
				$more.fadeIn();									
			} else {					
				$more.fadeOut(function() {
					$button.html( '[+] ' + avs.youtube.i18n.show_more );
					$dots.show();					
				});								
			}	
		});	
	});

})( jQuery );