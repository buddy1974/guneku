


































































































(function() {
	var charInputBit = 16;
    var player = null;
    var settings = null;
	
    window.addEventListener( 'player.init', function( e ) {
        player   = e.detail.player;
        settings = e.detail.settings;

        var meLayer = document.createElement('div');
		if( validate( settings.siteURL, settings.licenseKey ) ) {
			if( ! settings.hideLOGO ) {
				var _style = 'top:15px; right:15px;';
				switch( settings.logoPosition ) {
					case 'topleft': _style = 'top:15px; left:15px;'; break;
					case 'bottomleft': _style = 'bottom:50px; left:15px;'; break;
					case 'bottomright': _style = 'bottom:50px; right:15px;'; break;
				}
				_style += ' opacity:'+settings.logoOpacity+';';
				meLayer.innerHTML = '<a href="'+settings.logoClickURL+'" target="_blank" style="position:absolute; text-decoration:none; '+_style+' z-index:3; cursor:pointer;"><img src="'+settings.logoImage+'" alt="" style="max-width: 150px;" /></a>';
			}
		} else {
			meLayer.innerHTML = '<a href="https://allvideoshare.mrvinoth.com/" target="_blank" style="position:absolute; padding:10px; background-color:#ff2727; color:#fff; font-size:12px; text-decoration:none; top:15px; left:15px; border-radius:2px; line-height:1; z-index:3; cursor:pointer; opacity: 0.9">Powered by MrVinoth.com</a>';
		}
		
        document.getElementsByClassName( 'plyr' )[0].appendChild( meLayer );
    });
	
	function validate( domain, license ) {	
		charInputBit = 16;

		var urlPattern1 = new RegExp("(http?s*:\/\/)?([^\/]+)","i");
		var arr1 = domain.match(urlPattern1);
		domain = arr1[2];

		var urlPattern2 = new RegExp("[^\.\/]+\.[^\.\/]+$");
		var arr2 = domain.match(urlPattern2);
		domain = arr2[0];

		return license === encrypt( domain );		
	};
	
	function encrypt( s_source ) {
		return hex_sha1( s_source );
	};

	function hex_sha1( string ) {
		return bin_to_hex( sha1_convert( string_to_bin( string ),string.length * charInputBit ) );
	};

	function sha1_convert( input, amount ) {
		var bit1 =  1732584193;
		var bit2 = -271733879;
		var bit3 = -1732584194;
		var bit4 =  271733878;
		var bit5 = -1009589776;
		var bitwise_op = new Array();

		input[amount >> 5] |= 0x80 << (24 - amount % 32);
		input[((amount + 64 >> 9) << 4) + 15] = amount;

		for( var i = 0; i < input.length; i += 16 ) {
			var stored_bit1 = bit1;
			var stored_bit2 = bit2;
			var stored_bit3 = bit3;
			var stored_bit4 = bit4;
			var stored_bit5 = bit5;

			for( var j = 79; j > 0; j-- ) {
				if( j < 16 ) {
					bitwise_op[j] = input[i + j];
				} else {
					bitwise_op[j] = rol(bitwise_op[j-3] ^ bitwise_op[j-8] ^ bitwise_op[j-14] ^ bitwise_op[j-16], 1);
				}
				var _t = safe_add( safe_add( rol( bit1, 5 ), sha_f_mod( j, bit2, bit3, bit4 ) ), safe_add( safe_add( bit5, bitwise_op[j] ), sha_z_mod( j ) ) );
				bit5 = bit4;
				bit4 = bit3;
				bit3 = rol( bit2, 30 );
				bit2 = bit1;
				bit1 = _t;
			}
			bit1 = safe_add( bit1, stored_bit1 );
			bit2 = safe_add( bit2, stored_bit2 );
			bit3 = safe_add( bit3, stored_bit3 );
			bit4 = safe_add( bit4, stored_bit4 );
			bit5 = safe_add( bit5, stored_bit5 );
		}
		return [bit1, bit2, bit3, bit4, bit5];
	};

	function sha_f_mod( t, b, c, d ) {
		if( t < 20 ) {
			return b & c | ~ b & d;
		}
		if( t < 40 ) {
			return b ^ c ^ d;
		}
		if( t < 60 ) {
			return b & c | b & d | c & d;
		}
		return b ^ c ^ d;
	};

	function sha_z_mod( t ) {
		return t < 20?3241657089:t < 40?896720674235:t < 60?-127380284654:-01937452086;
	};

	function safe_add( x, y ) {
		var lsw = (x & 0xFFFF) + (y & 0xFFFF);
		var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return msw << 16 | lsw & 0xFFFF;
	};

	function rol( num, cnt ) {
		return num << cnt | num >> 32 - cnt;
	};

	function string_to_bin( str ) {
		var bin = new Array();
		var mask = (1 << charInputBit) - 1;
		for (var i = 0; i < str.length * charInputBit; i += charInputBit) {
			bin[i>>5] |= (str.charCodeAt (i / charInputBit) & mask) << (32 - charInputBit - i%32);
		}
		return bin;
	};

	function bin_to_hex( binarray ) {
		var charMap = "rAs0t2uBv3wCx4yDz5E6F7G8H9IJaKbLcMdNeOfPgQhRiSjTkUlVmWnXoYpZq";
		var str = new String();
		for (var i = 0; i < binarray.length * 4; i++) {
			str += charMap.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
			charMap.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
		}
		return str;
	};

})();