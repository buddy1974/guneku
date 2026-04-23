(function( $ ) {
  'use strict';

  /**
   * Called when the page has loaded.
   *
   * @since 4.2.0
   */
  $(function() {   
        
    // Select Video Modal
    var elements = document.querySelectorAll( '.all-video-share-select-link' );

    for ( var i = 0, l = elements.length; l > i; i += 1 ) {
      elements[ i ].addEventListener( 'click', function( event ) {
        event.preventDefault();

        var functionName = event.target.getAttribute( 'data-function' );

        window.parent[ functionName ](
          event.target.getAttribute( 'data-value' ),
          event.target.getAttribute( 'data-title' ),
          null,
          null,
          event.target.getAttribute( 'data-uri' ),
          event.target.getAttribute( 'data-language' ),
          null
        );

        if ( window.parent.Joomla.Modal ) {
          window.parent.Joomla.Modal.getCurrent().close();
        };
      });
    };
    
  });

})( jQuery );