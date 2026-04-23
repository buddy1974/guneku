window.Joomla = window.Joomla || {};

(function (window, Joomla) {
    Joomla.toggleField = function (id, task, field) {

        var f = document.adminForm, i = 0, cbx, cb = f[ id ];

        if (!cb) return false;

        while (true) {
            cbx = f[ 'cb' + i ];

            if (!cbx) break;

            cbx.checked = false;
            i++;
        }

        var inputField   = document.createElement('input');

        inputField.type  = 'hidden';
        inputField.name  = 'field';
        inputField.value = field;
        f.appendChild(inputField);

        cb.checked = true;
        f.boxchecked.value = 1;
        Joomla.submitform(task);

        return false;
    };
})(window, Joomla);

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
	 * Called when the page has loaded.
	 *
	 * @since 4.1.0
	 */
	$(function() {
        // Clear API cache
        $( '#avs-clear-cache' ).on( 'click', function( e ) {
            e.preventDefault();

            var $this   = $( this );
            var baseurl = $this.data( 'baseurl' );
            var label   = $this.data( 'label' );

            $this.html( '<span class="fa-spin icon-spinner me-2" aria-hidden="true"></span> ' + label ).prop( 'disabled', true );

            var xmlhttp;

			if ( window.XMLHttpRequest ) {
				xmlhttp = new XMLHttpRequest();
			} else {
				xmlhttp = new ActiveXObject( 'Microsoft.XMLHTTP' );
			};

			xmlhttp.onreadystatechange = function() {
				if ( xmlhttp.readyState == 4 && xmlhttp.status == 200 ) {
					if ( xmlhttp.responseText ) {	
						$this.html( '<span class="icon-ok me-2" aria-hidden="true"></span> ' + label ).prop( 'disabled', false );
					};
				};
			};	

			xmlhttp.open( 'GET', baseurl + 'administrator/index.php?option=com_allvideoshare&task=clearcache&format=raw', true );
			xmlhttp.send();
        });
        
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
        $( '#jform_type', '#video-form' ).on('change', function() {
            var type = $( this ).val();

            $( '.required-conditionally' ).removeClass( 'required' ).removeAttr( 'required' );

            switch ( type ) {
                case 'youtube':
                case 'vimeo':
                case 'hls':
                case 'thirdparty':
                    $( '#jform_' + type ).addClass( 'required' );
                    break;
                default:
                    toggleVideoFieldsRequired();
            };

            document.formvalidator.attachToForm( $( '#video-form' ).get(0) ); 
        }).trigger( 'change' );

        $( 'input[name="jform_video_field_type"]' ).on( 'change', function() {
            toggleVideoFieldsRequired();
            document.formvalidator.attachToForm( $( '#video-form' ).get(0) ); 
        });

        // Modal
        var modalbox = document.getElementById( 'avs-modal-box' );

        if ( modalbox ) {
            var modalTitle = modalbox.querySelector( '.modal-title' );
            var modalBody = modalbox.querySelector( '.modal-body' );	

            modalbox.addEventListener( 'show.bs.modal', function( event ) {
                // Button that triggered the modal
                var button = event.relatedTarget;

                // Set the modal title
                var title = button.getAttribute( 'data-bs-title' );
                modalTitle.textContent = title;               
                
                // Set the modal content
                var item_url = button.getAttribute( 'data-bs-url' );
                modalBody.innerHTML = '<iframe width="640" height="360" src="' + item_url + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
            });

            modalbox.addEventListener( 'hidden.bs.modal', function( event ) {
                // Set the modal title & content empty
                modalTitle.textContent = ''; 
                modalBody.innerHTML = '';
            });
        } 
        
        // Captions: Add New
        $( '#avs-captions-add-new' ).on( 'click', function() {
            var html;

            html += '<tr class="avs-caption">';

            // Sortable handle
            html += '<td class="text-center d-none d-md-table-cell">' + 
                '<span class="sortable-handler">' + 
                    '<span class="icon-ellipsis-v" aria-hidden="true"></span>' + 
                '</span>' + 
            '</td>';

            // Captions File
            html += '<td>' +                 
                '<div class="avs-caption-file"><a href="javascript:void(0)" class="avs-caption-upload btn btn-success btn-sm">' + avs.i18n_upload_file + '</a></div>' + 
                '<input type="hidden" name="jform[captions][src][]" />' + 
                '<input type="file" name="jform[captions][file][]" class="hidden" />' + 
            '</td>';

            // Label
            html += '<td>' + 
                '<input type="text" name="jform[captions][label][]" placeholder="English" class="form-control form-control-sm" />' + 
            '</td>';

            // Srclang
            html += '<td>' + 
                '<input type="text" name="jform[captions][srclang][]" placeholder="en" class="form-control form-control-sm" />' + 
            '</td>';

            // Remove
            html += '<td class="text-center">' + 
                '<span class="tbody-icon">' +
                    '<a href="javascript: void(0);" class="avs-caption-remove">' + 
                        '<span class="icon-delete" aria-hidden="true"></span>' + 
                    '</a>' + 
                '<span>' +
            '</td>';

            html += '</tr>';

            $( '#avs-captions-empty-note' ).addClass( 'hidden' );
            $( '#avs-captions' ).append( html );
        });

        // Captions: Custom Browse Button
        $( '#avs-captions' ).on( 'click', '.avs-caption-upload', function( e ) {
            e.preventDefault();
            $( this ).closest( 'td' ).find( 'input[type=file]' ).trigger( 'click' );
        });

        // Captions: On File Selected
        $( '#avs-captions' ).on( 'change', 'input[type=file]', function( e ) {
            var fileName = e.target.files[0].name;
			if ( fileName ) {
                $( this ).closest( 'td' ).find( '.avs-caption-file' ).html( fileName );
            }	
        });

        // Captions: Remove
        $( document ).on( 'click', '.avs-caption-remove', function() {
            $( this ).closest( 'tr' ).remove();
            
            if ( $( '#avs-captions tr' ).length == 0 ) {
                $( '#avs-captions-empty-note' ).removeClass( 'hidden' );
            }
        });
	});

})( jQuery );