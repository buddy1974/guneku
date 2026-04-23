(function( $ ) {
	'use strict';

    /**
	 * Toggle video upload/url fields required
	 *
	 * @since  4.1.0
	 */
    function toggleVideoFieldsRequired() {
        if ( $( 'input[name="jform_video_field_type"]:checked' ).val() == 'url' ) {
            $( '#jform_video' ).removeClass( 'required' ).removeAttr( 'required' );
            $( '#jform_video_url' ).addClass( 'required' );
        } else {
            $( '#jform_video_url' ).removeClass( 'required' ).removeAttr( 'required' );
            $( '#jform_video' ).addClass( 'required' );
        };
    }

	/**
	 * Called when the page has loaded
	 *
	 * @since  4.1.0
	 */
	$(function() {
        // Toggle upload/url fields
        $( '.avs-form-field-type input[type=radio]' ).on( 'change', function() {
            var type = this.value;

            if ( type == 'url' ) {
                $( this ).closest( '.controls' ).find( '.avs-form-field-upload' ).hide();
                $( this ).closest( '.controls' ).find( '.avs-form-field-url' ).show();     
            } else {
                $( this ).closest( '.controls' ).find( '.avs-form-field-url' ).hide();
                $( this ).closest( '.controls' ).find( '.avs-form-field-upload' ).show();
            }
        });

        // Append a star on the conditionally required field elements
        $( '.required-conditionally-label' ).append( '<span class="star" aria-hidden="true">&nbsp;*</span>' );

        // Toggle required fields
        $( '#jform_type', '#form-video' ).on('change', function() {
            var type = $( this ).val();

            $( '.required-conditionally' ).removeClass( 'required' ).removeAttr( 'required' );

            switch ( type ) {
                case 'youtube':
                case 'vimeo':
                case 'hls':
                    $( '#jform_' + type ).addClass( 'required' );
                    break;
                default:
                    toggleVideoFieldsRequired();
            };

            document.formvalidator.attachToForm( $( '#form-video' ).get(0) );
        }).trigger( 'change' );

        $( 'input[name="jform_video_field_type"]' ).on( 'change', function() {
            toggleVideoFieldsRequired();
            document.formvalidator.attachToForm( $( '#form-video' ).get(0) );
        });
	});

})( jQuery );