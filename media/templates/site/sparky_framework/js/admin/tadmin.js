/*------------------------------------------------------------------------
# "Sparky Framework" - Joomla Template Framework
# Copyright (C) 2016 HotThemes. All Rights Reserved.
# License: http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 only
# Author: HotThemes
# Website: http://www.hotjoomlatemplates.com
-------------------------------------------------------------------------*/
$ = jQuery;

var jqSet = 0; 
var jqSetInterval =  setInterval(function(){
	$ = jQuery;
	jqSet++;
	if(jqSet == 50)
		clearInterval(jqSetInterval);
},100);
 
var TabsInit = false;
var HORTabsInit = false;
var surogatID = 0;
var stabitem_n = 0;

function getSurogateID(){
	surogatID++;
	return String(surogatID);
}

function codeMirrorInit() {
	var editor_css = CodeMirror.fromTextArea(document.getElementById("jform_params_customcodecss"), {
		lineNumbers: true,
		viewportMargin: Infinity,
		mode:  "css"
	});
	var editor_js = CodeMirror.fromTextArea(document.getElementById("jform_params_customcodejs"), {
		lineNumbers: true,
		viewportMargin: Infinity,
		mode:  "javascript"
	});
	var editor_head = CodeMirror.fromTextArea(document.getElementById("jform_params_customhead"), {
		lineNumbers: true,
		viewportMargin: Infinity
	});
}

function doExport(base,handlerurl,withName){

	if(!withName || withName == '' || withName == undefined) {
		alert('Please enter a valid name for template!');
		return;
	}

	jQuery.ajax({
		url: base + handlerurl,
		type: 'POST',
		data: jQuery('#style-form').serialize(),
		cache: false
	}).done(function( html ) {
		var vals = html.split("|");
		if(vals[0] == "OK"){
			window.location = base + "templates/" + TADMIN_TEMPLATE_FOLDER + "/export/" + vals[1];
		}else{
			alert(html);
		}
	});
	return false;
}

jQuery(window).on('load', function(){
   
	// move Style Name to Details tab
	jQuery("form#style-form > div").first().appendTo("section#details .col-lg-9 .card .card-body").show();

	var optContainer = jQuery('joomla-tab');
    var menu = null;
	var dtlPanel = null;
	var fieldpanels = null;
	var maPanel = null;

	jQuery('joomla-tab').attr('id','options').addClass('tab-pane');

	optContainer = jQuery('joomla-tab');

	menu = jQuery("<ul id='tadmin_menu'>").prependTo(optContainer);

	fieldpanels = optContainer.find('section');
	
	fieldpanels.each(function(ind){
		var tTilte = jQuery('ul[role="tablist"] a[href="#' + jQuery(this).attr('id') + '"]').text();
		jQuery('ul[role="tablist"] a[href="#' + jQuery(this).attr('id') + '"]').parent().remove();
		menu.append(jQuery('<li><a href="#' +  jQuery(this).attr('id') + '" >' + tTilte + '</a></li>'));
		jQuery(this).removeClass('tab-pane').addClass('tadmin_tab');
	});

	optContainer.tabs({
		fx: { opacity: 'toggle' },
		hide: false,
		show: false,
		selected: (jQuery.cookie('tadmin_tab_cookie') != null)?		parseInt(jQuery.cookie('tadmin_tab_cookie')) : 0,
		active: (jQuery.cookie('tadmin_tab_cookie') != null)?		parseInt(jQuery.cookie('tadmin_tab_cookie')) : 0
	});
	
	jQuery('joomla-tab section').each(function(ind){
		if(jQuery(this).find('.subtabstart')[0]){
			var htabs = jQuery('<div class="hortabscontainer"></div>');
			jQuery(this).prepend(htabs);
			var htabs_menu = jQuery('<div class="hortabs"></div>');
			var htabs_tabs = jQuery('<div class="curvedContainer"></div>');
			htabs.append(htabs_menu);
			htabs.append(htabs_tabs);

			var Title = TADMSCRIPTTRANS.general;
			if(jQuery(this).find('.control-group:first .subtabstart')[0]){
				Title = jQuery(this).find('.control-group:first label').text();
				jQuery(this).find('.control-group:first').remove();
			}

			var menu_item = jQuery('<div id="stid' + (stabitem_n++) + '" class="tab selected first subtab_menu_item" ><div class="hortabslink">' + Title + '</div><div class="hortabsarrow"></div></div>');
			var tab_item  = jQuery('<div class="tabcontent" style="display:block"><div class="adminformlist" ></div></div>');
			menu_item.appendTo(htabs_menu);
			tab_item.appendTo(htabs_tabs);

			jQuery(this).find('.control-group').each(function(index){

				if(jQuery(this).find('.subtabstart')[0]){

					Title = jQuery(this).find('label').text();
					if(!jQuery.trim(Title))
						Title = jQuery(this).find('h3').text();

					menu_item = jQuery('<div id="stid' + (stabitem_n++) + '"  class="tab subtab_menu_item" ><div class="hortabslink">' + Title + '</div><div class="hortabsarrow"></div></div>');
					tab_item  = jQuery('<div class="tabcontent"  style="display:none"><div class="adminformlist" ></div></div>');

					menu_item.appendTo(htabs_menu);
					tab_item.appendTo(htabs_tabs);

					jQuery(this).remove();

				}else{

					jQuery(this).appendTo(tab_item.find('.adminformlist'));

				}

			});
		menu_item.addClass('last');

		}
	});
	
	jQuery('.tadmin_tab .control-group').append(jQuery('<div style="clear:both;"></div>'));
	
	jQuery('.subtab_menu_item').click(function(){
		jQuery.cookie('subtab_tab_cookie', jQuery(this).attr("id"), { expires: 7, path: '/' });
		jQuery(window).trigger('resize');
	});
	
	if(jQuery('#' + jQuery.cookie('subtab_tab_cookie') )[0]){
		jQuery(window).on('load', function(){
			jQuery('#' + jQuery.cookie('subtab_tab_cookie') ).trigger('click');
		});
	}
	
});

jQuery(window).on('load', function(){
 
	if(!HORTabsInit){

		window.hortabswap = function(tab){
			var curMenu= tab;

			curMenu.parent().find('*')	.removeClass("selected")
										.removeClass('ui-tabs-selected')
										.removeClass('ui-state-active');

			curMenu	.addClass("selected")
					.addClass('ui-tabs-selected')
					.addClass('ui-state-active');

			var index = curMenu.index();
			
			curMenu.parent().parent().find(".curvedContainer .tabcontent").css("display","none");
			
			jQuery(curMenu.parent().parent().find(".curvedContainer .tabcontent")[index]).css("display","block");
			
			jQuery(curMenu.attr('href')).show();
			
			var designation = curMenu.closest('.tadmin_tab').attr('id');
			jQuery.cookie(designation, curMenu.index(), { expires: 7, path: '/' });
		};
	
		jQuery(".hortabs .tab").click(function() {
			window.hortabswap(jQuery(this));
		});
		
		
		jQuery('.tadmin_tab').each(function(i){
			if(jQuery.cookie(jQuery(this).attr('id'))){
				window.hortabswap(jQuery(jQuery(this).find('.hortabs .tab')[ parseInt(jQuery.cookie(jQuery(this).attr('id')))]));
			}
		});
		
		HORTabsInit = true;

	}

	codeMirrorInit();


});

jQuery.cookie = function (key, value, options) {

    // key and at least value given, set cookie...
    if (arguments.length > 1 && String(value) !== "[object Object]") {
        options = jQuery.extend({}, options);

        if (value === null || value === undefined) {
            options.expires = -1;
        }

        if (typeof options.expires === 'number') {
            var days = options.expires, t = options.expires = new Date();
            t.setDate(t.getDate() + days);
        }

        value = String(value);

        return (document.cookie = [
        encodeURIComponent(key), '=',
        options.raw ? value : encodeURIComponent(value),
        options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
        options.path ? '; path=' + options.path : '',
        options.domain ? '; domain=' + options.domain : '',
        options.secure ? '; secure' : ''
    ].join(''));
    }

    // key and possibly options given, get cookie...
    options = value || {};
    var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
    return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
};

	
jQuery(document).on('click',"#tadmin_menu [role='tab']", function(e){
	try{
		jQuery.cookie('tadmin_tab_cookie', jQuery(this).index(), { expires: 30, path: '/' });
		jQuery(window).trigger('resize');
	}
	catch(ex){
	}
});

jQuery(document).on('click',"button[aria-controls='attrib-customcode']", function(e){
	codeMirrorInit();
});

var created = false;

var mini_settings = function(){
	jQuery.minicolors.defaults.theme='bootstrap';
	if(created)
		jQuery(".predefinedcolor").each(function(){ jQuery(this).minicolors('destroy');});
	jQuery(".predefinedcolor").each(function(){ jQuery(this).minicolors({swatches: [sparkycolor1, sparkycolor2, sparkycolor3, sparkycolor4, sparkycolor5, sparkycolor6], theme: 'bootstrap'});});
	created = true;
};

jQuery(document).ready(function(){
	
	jQuery(document).on('click','.menusSettingsTab',mini_settings);
	jQuery(document).on('change','.MenuTypeSelect',mini_settings);

	if(!window.checkColor){
		window.checkColor = function(jEL){
			try{
				var rgbArr = jEL.css('backgroundColor').toLowerCase().replace('rgb(','').replace(')','').split(',');
				rgbArr[0] = parseInt(rgbArr[0]);
				rgbArr[1] = parseInt(rgbArr[1]);
				rgbArr[2] = parseInt(rgbArr[2]);

				if( rgbArr[0] + rgbArr[1] + rgbArr[2] <  380){
					jEL.css('color','white');
				}else{
					jEL.css('color','black');
				}
			}catch(e){}
		};
	}
});

var flipcounter = 0;
jQuery(document).ready(function(){

	if(!window.createFlipYesNo){
		window.createFlipYesNo = function(obj){
			flipcounter++;
			obj = jQuery(obj);
			if(String(obj.attr('flipcreated')) == "1") return;
			obj.attr('flipcreated','1');

			var sHtml = '<ul id="flip' + String(flipcounter) + '" class="flipyesno">' +
		              '<li style="position:relative;left:' + (obj.val() == "1" ? "0px" : "-55px" ) + ';background: url(' + TADMIN_JOOMLABASE + '/media/templates/site/sparky_framework/images/ipbutton.png' + ') no-repeat 0 -14px;width: 108px;height:24px;margin:0;padding:0;"><span></span></li>' +
		           '</ul>';
			var flip_obj = jQuery(sHtml);
			flip_obj.insertAfter(obj);
			flip_obj.disableSelection();

			flip_obj.find('LI').click(function(){
				if(parseInt(jQuery(this).css('left')) == 0){
					jQuery(this).animate({left:'-55px'},300);
					obj.val(0);
				}else{
					jQuery(this).animate({left:'0px'},300);
					obj.val(1);
				}
			}).disableSelection(); 

		};
   
		jQuery('.flipyesno').each(function(ind){
			if(!jQuery(this).closest('.menu_parms_panel')[0])
			window.createFlipYesNo(jQuery(this));
		});
	}

});

jQuery(document).ready(function(){

	jQuery('.width_value input').each(function(ind){
		var WIDTH_ID = jQuery(this).attr('id');
		if(WIDTH_ID!="jform_params_gridSystem"){
			jQuery("#width" + WIDTH_ID).slider({
			value:jQuery(this).val(),
			min: 312,
			max: 1872,
			step: 12,
			slide: function( event, ui ) {
				jQuery("#" + WIDTH_ID).val(  ui.value );
				jQuery("#disp" + WIDTH_ID).html( ui.value + "px");
			},
			orientation: "horizontal"
		});
	
		}
	});

	// make tabs in Menus Settings

	var selectedMenuType;
	jQuery('div.menusSettingsContainer').hide();
	jQuery('h4.menusSettingsTab').click(function() {
		jQuery(this).toggleClass('opentab');
		jQuery(this).next().slideToggle(300);

		// show menu graphic on menu tab open
		selectedMenuType = jQuery(this).next().find("select").val();
		jQuery(this).next().find(".menus_graphics").addClass("menus_graphics_" + selectedMenuType);

	});

	// show menu graphic on menu type change
	jQuery('select.MenuTypeSelect').change(function() {

		jQuery(this).siblings('.menus_graphics').removeClass("menus_graphics_" + selectedMenuType);

		selectedMenuType = jQuery(this).val();
		jQuery(this).siblings('.menus_graphics').addClass("menus_graphics_" + selectedMenuType);

	});

	// change menu graphics in Menus Settings


});

// Google fonts integration

var menu_name="";
var menu_type="";
var parameter_for="";
var newValHot="";

function saveParams(){

	var menus = JSON.parse(jQuery("#jform_params_mnucfg").val());
	for(var i=0; i<menus.length;i++ ){
		if ( menus[i]['name']==menu_name && menus[i]['type']==menu_type){
				var obj = JSON.parse(newValHot.replace(/\\'/g, "\'"));
				menus[i]['config']["'"+parameter_for+"'"]=newValHot;
				menus[i]['config']["'font_family_"+parameter_for+"'"]=obj['fontFamily'];
				JSON.stringify(menus);
				jQuery("#jform_params_mnucfg").val(menus);
				
				jQuery("[menu='"+menu_name+"']").next().find("[parameter='"+parameter_for+"']").prev().val(obj['fontFamily']).trigger('change');
				jQuery("[menu='"+menu_name+"']").next().find("[parameter='"+parameter_for+"']").prev().attr("data-original-title",obj['fontFamily']);
				jQuery("[menu='"+menu_name+"']").next().find("[parameter='"+parameter_for+"']").val(newValHot);
		}
	}

};
function saveParams2(id){

	jQuery("#"+id).val(newValHot);
	newValHot = newValHot.replace(/\\'/g, "\'");
	var obj = JSON.parse(newValHot);
	jQuery("#"+id).prev().val(obj['fontFamily']).trigger('change');
	jQuery("#"+id).prev().attr("data-original-title", obj['fontFamily']);

};

// Params for fonts in tab

function saveParams3(){
	var obj = JSON.parse(newValHot);
	var urlObject = JSON.parse(jQuery("#jform_params_googleUrl").val());
	var singleAdd = [];

	if(typeof urlObject[obj['fontFamily']] !== 'undefined'){
		urlObject[obj['fontFamily']]['variant']=obj['variant'];
		urlObject[obj['fontFamily']]['charsets'] = obj['charsets'];
	}
	else{
		urlObject[obj['fontFamily']]={};
		urlObject[obj['fontFamily']]['variant']=obj['variant'];
		urlObject[obj['fontFamily']]['charsets'] = obj['charsets'];
	}
	jQuery("#jform_params_googleUrl").val(JSON.stringify(urlObject));
	jQuery(".googleFontPreview").remove();
	Joomla.submitbutton('style.apply');
};

function removeFonts(){
	var urlObject = JSON.parse(jQuery("#jform_params_googleUrl").val());
	var for_remove = [];
	var tmp1 = {};
	tmp1['fontFamily'] = "Arial, Helvetica, sans-serif";
	tmp1['fontWeight'] = "normal";
	tmp1['fontStyle'] = "normal";
	
	jQuery('.selected_fonts input:checked').each(function(){
		var val = jQuery(this).val();
		
		jQuery('[parameter="font_family_hotfont"]').each(function(){
			var tmp = JSON.parse(jQuery(this).val().replace(/\\'/g, "\'"));
			if(tmp['fontFamily'] == val ){
				
				var menu_name = jQuery(this).parents('div.menusSettingsContainer').find('[menu]').attr("menu");
				var menu_type = jQuery(this).parents('div.menusSettingsContainer').find('[menu]').val();
				
				var menus = JSON.parse(jQuery("#jform_params_mnucfg").val());
				for(var i=0; i<menus.length;i++ ){
					if ( menus[i]['name']==menu_name && menus[i]['type']==menu_type){
							menus[i]['config']['font_family_hotfont']=tmp1;
							menus[i]['config']['font_family_hotfont_lbl']=tmp1['fontFamily'];
							JSON.stringify(menus);
							jQuery("#jform_params_mnucfg").val(menus);
							
							jQuery("[menu='"+menu_name+"']").next().find('[parameter="font_family_hotfont"]').prev().val(tmp1['fontFamily']).trigger('change');
							jQuery("[menu='"+menu_name+"']").next().find('[parameter="font_family_hotfont"]').prev().attr("data-original-title",tmp1['fontFamily']);
							jQuery("[menu='"+menu_name+"']").next().find('[parameter="font_family_hotfont"]').val(JSON.stringify(tmp1));
							//jQuery("[menu='"+menu_name+"']").next().find("[parameter='"+parameter_for+"']").prev().trigger('change');
					}
				}
				
			}
		});
		jQuery("input.font").each(function(){
			var tmp = JSON.parse(jQuery(this).val().replace(/\\'/g, "\'"));
			if(tmp['fontFamily'] == val ){
				jQuery(this).val(JSON.stringify(tmp1));
			}
		});
		
		delete urlObject[val];
	});
	jQuery("#jform_params_googleUrl").val(JSON.stringify(urlObject));
	
	setTimeout(function(){
		Joomla.submitbutton('style.apply');
	},500);
}

(function() {
	var wf = document.createElement('script');
	wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
	  '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
	wf.type = 'text/javascript';
	wf.async = 'true';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(wf, s);
})();

var once = true;

jQuery(document).ready(function(){
		
		jQuery('[data-toggle="tooltip_font"]').tooltip();
	
		var fromSearch = false;
		var weightId = ""; 
		var styleId = "";
		var family = "";
		var style = "";
		var weight = "";
		var id = "";
		var from_menu = false;
		var object = [];
		var categories = [];
		var charsets = [];
		var subset = "";
		
		var weights = {
			100:"Thin",
			200:"Extra Light",
			300:"Light",
			400:"Normal",
			500:"Medium",
			600:"Semi Bold",
			700:"Bold",
			800:"Extra Bold ",
			900:"Black"
		}
		
		var link = jQuery("link[href*='tadmin.css']").attr("href");
		var first = link.indexOf("media/");
		var second = link.indexOf("/css");
		
		// "media/" contains 6 chars
		link = link.substring(first+6,second);
		var json_google;
		jQuery.getJSON('../media/'+link+'/js/admin/google-fonts.json', function(){	 
		}).done(function( json ) {
			json_google = json;
		}).fail(function() {
			alert("Google fonts can't be loaded");
		});
		
		function changeText(){
			family = jQuery("#sbox-window select:eq(0)").val();
			weight = jQuery('#sbox-window select:eq(1)').val();
			style = jQuery('#sbox-window select:eq(2)').val();
		
			jQuery("#sbox-window .textPreview").css({
				'font-family' : family,
				'font-style' : style,
				'font-weight' : weight
			});
				
			newValHot = JSON.stringify({'fontFamily':family,'fontWeight':weight,'fontStyle':style,'googleFont':'no'});
			newValHot = newValHot.replace(/\'/g, "\\'");

			if(from_menu){
				jQuery("#system button").first().attr('onclick',"saveParams();SqueezeBox.close();");
			}
			else{
				jQuery("button.system_fonts_save").attr('onclick',"saveParams2('"+id+"');SqueezeBox.close();");
			}
		};

		jQuery(document).on('change',"select[menu]",function(){
			SqueezeBox.assign(jQuery('a.modal.menu').get(), {
				parse: 'rel'
			});
		});

		jQuery(document).on('mousedown','.font .system, .menusSettingsContainer .system',function(){
			newValHot = "";
			from_menu = jQuery(this).hasClass('menu');

			if(from_menu && once) {  
				once = false;	
				SqueezeBox.initialize({});
				SqueezeBox.assign($('a.modal').get(), {
					parse: 'rel'
				});
			}
			
			jQuery("#system .fontPreview").html("");
			var for_parse = jQuery(this).prev().val().replace(/\\'/g, "\'");
			for_parse = for_parse.replace(/\\'/g, "\'");
			var currentValues = JSON.parse(for_parse);
			
			family = currentValues['fontFamily'];
			weight = currentValues['fontWeight'];
			style = currentValues['fontStyle'];
			var google_font = currentValues['googleFont'];

			id = jQuery(this).prev().attr("id");
			
			if(google_font=="yes"){
				setTimeout(function(){
					jQuery("#sbox-window select:eq(0)").val("Arial, Helvetica, sans-serif").trigger("liszt:updated");
					jQuery('#sbox-window select:eq(1)').val('normal').trigger("liszt:updated");
					jQuery('#sbox-window select:eq(2)').val('normal').trigger("liszt:updated");
				},500);
				
				jQuery("#system .textPreview").css({
					'font-family' : "Arial, Helvetica, sans-serif",
					'font-style' : 'normal',
					'font-weight' : 'normal'
				});
				jQuery("#system .fontPreview").append("Arial, Helvetica, sans-serif");
				family = "Arial, Helvetica, sans-serif";
				weight = "normal";
				style = "normal";
			} else {
				setTimeout(function(){
					jQuery("#sbox-window select:eq(0)").val(family).trigger("liszt:updated");
					jQuery('#sbox-window select:eq(1)').val(weight).trigger("liszt:updated");
					jQuery('#sbox-window select:eq(2)').val(style).trigger("liszt:updated");
				},500);
				
				jQuery("#system .textPreview").css({
					'font-family' : family,
					'font-style' : style,
					'font-weight' : weight
				});
				jQuery("#system .fontPreview").append(family);
			}
			
			//newValHot = JSON.stringify({'fontFamily':family,'fontWeight':weight,'fontStyle':style,'googleFont':'no'}).replace(/'/g, '\\\'');
			newValHot = JSON.stringify({'fontFamily':family,'fontWeight':weight,'fontStyle':style,'googleFont':'no'});
			newValHot = newValHot.replace(/\'/g, "\\'");
			
			if(from_menu){
				menu_name = jQuery(this).parents('div.menusSettingsContainer').find('[menu]').attr("menu");
				menu_type = jQuery(this).parents('div.menusSettingsContainer').find('[menu]').val();
				parameter_for = jQuery(this).prev().attr("parameter");
				
				jQuery("#system button").first().attr('onclick',"saveParams();SqueezeBox.close();");
			} else{
				jQuery("#system button").first().attr('onclick',"saveParams2('"+id+"');SqueezeBox.close();");
			}
			
		});
		jQuery(document).on('change',"#sbox-window .fonts select, #sbox-window .weightAndStyle select",function(){
			if(jQuery(this).val().length>15){
				jQuery("#sbox-window .fontPreview").html("");
				jQuery("#sbox-window .fontPreview").append(jQuery(this).val());
			}
			changeText();
			
		});
		
		jQuery(document).keypress(function(event){
			var keycode = (event.keyCode ? event.keyCode : event.which);
			if (!jQuery("textarea").is(":focus")) {
				if(keycode == "13"){
					event.preventDefault();   
					jQuery("#google .search_field").trigger("change");
				}
			}
		});
		
		// for google font
		var gFont = false;
		// first click
		jQuery(document).on('mousedown','.font .google, .menusSettingsContainer .google',function(e){
			from_menu = jQuery(this).hasClass('menu');
			gFont = true;
			newValHot = "";
			object = [];
			if(from_menu && once) {  
				once = false;	
				SqueezeBox.initialize({});
				SqueezeBox.assign(jQuery('a.modal').get(), {
					parse: 'rel'
				});
			}
			if(from_menu){
				menu_name = jQuery(this).parents('div.menusSettingsContainer').find('[menu]').attr("menu");
				menu_type = jQuery(this).parents('div.menusSettingsContainer').find('[menu]').val();
				parameter_for = jQuery(this).prev().prev().attr("parameter");	
				jQuery("#google button").first().attr('onclick',"saveParams();SqueezeBox.close();");
			} else {
				id = jQuery(this).siblings("input[type='hidden']").attr("id");
				jQuery("#google button").first().attr('onclick',"saveParams2('"+id+"');SqueezeBox.close();");
			}
			
			var for_parse = jQuery(this).prev().prev().val();
			for_parse = for_parse.replace(/\\'/g,"'");
			var currentValues = JSON.parse(for_parse);
			
			//added
			var googleFonts = JSON.parse(jQuery("#jform_params_googleUrl").val());
			
			var keys = Object.keys(googleFonts);
			
			var k = 0;
			for(i = 0 ; i < json_google.items.length; i++){
				
				if(jQuery.inArray(json_google.items[i]['family'],keys)!=-1){
					object[k]=json_google.items[i];
					if(googleFonts[json_google.items[i]['family']]['variant'].constructor === Array)
						object[k]['variants']=googleFonts[json_google.items[i]['family']]['variant'];
					else
					{
						var temp = [];
						temp.push(googleFonts[json_google.items[i]['family']]['variant']);
						object[k]['variants']=temp;
					}
						
					object[k]['subsets']=googleFonts[json_google.items[i]['family']]['charsets'];
					k++;
				}
			}
	
	
			setTimeout(function(){	
				jQuery("#sbox-content .googleFontPreview")[0].onscroll = function(){
				jQuery('#sbox-content .googleFontPreview [data-toggle="tooltip"]').popover('hide');
				jQuery('#sbox-content .in.close_it').collapse('hide');
			
				setTimeout(function(){
					renderFont();
				},100);
					
				}
				apendFonts();
				renderFont();
			},500);
			
			setTimeout(function(){
				jQuery('.multiselect-container.dropdown-menu').first().find('li a label').each(function(){
					for(var k=0;k<currentValues['categories'].length;k++){
						if(jQuery(this).find('input').val() == currentValues['categories'][k])
							jQuery(this).trigger('click');
					}
				});
				
				jQuery('.multiselect-container.dropdown-menu').last().find('li a label').each(function(){
					if(jQuery(this).find('input').val() == currentValues['subset'])
						jQuery(this).trigger('click');							
				});
				
				jQuery("#collapseList"+currentValues['index']+" input[value='"+currentValues['variant']+"']").trigger('click');
				
				jQuery("#tooltip_font"+currentValues['index']+" input").each(function(){
					for(k=0 ; k< currentValues['charsets'].length;k++){
						if(jQuery(this).attr("text")==currentValues['charsets'][k]){
							jQuery(this).attr('checked','checked');
						}
					}
				});
				
				jQuery(".well[num='"+currentValues['index']+"']").trigger('click');
				
				smooth_scroll();
			},500);

			
		});
		
		function smooth_scroll(){
			container = jQuery('.googleFontPreview').last();
			scrollTo = jQuery('.well.selected');
			if(jQuery('.well.selected').length && jQuery('.googleFontPreview').last().length)
				container.animate({
					scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
					},100);
		};

		// Font change

		jQuery(document).on('click',"#sbox-content .panel-collapse input[type='checkbox']", function(){
			var current_style= jQuery(this).next('span').attr('style');
			var index = jQuery(this).parents('.panel-collapse').attr('id').replace(/\D/g,'');
			var current_label = jQuery(this).prev().html();
			jQuery(".well[num='"+index+"']").find('.custom_label p').html(current_label);
			jQuery(".well[num='"+index+"']").find('.custom_label span').attr("style",current_style);
			jQuery(".well[num='"+index+"']").find('.custom_label span').attr("variant",jQuery(this).next('span').attr('variant'));
			jQuery(this).parent().siblings('div').find('input').prop('checked',false);
			jQuery('#sbox-content .in').collapse('hide');
			
		});
		
		jQuery(document).on('click',".popover.in input[type='checkbox']", function(){
			var id_new = jQuery(this).parents('.popover').prev().attr("data-pop");
			var property = jQuery(this).attr('text');
			if(jQuery(this).attr('checked')){
				jQuery("#"+id_new).find('input[text="'+property+'"]').attr('checked','checked');
			} else {
				jQuery("#"+id_new).find('input[text="'+property+'"]').attr('checked',false);
			}	
		});
		
		jQuery(document).on('mouseleave','.popover',function(){
			var id_new = jQuery(this).prev().attr("data-pop");
			jQuery('#sbox-content .googleFontPreview  [data-toggle="tooltip"]').popover('hide');
			
		});	
		
		jQuery(document).on('click',"a[data-toggle='tooltip']",function(e){
			e.stopImmediatePropagation();
		});
		
		// Font change and save values
		
		jQuery(document).on('click','#sbox-content .well, #sbox-content .panel-collapse.show input[type="checkbox"]', function(){
			if((jQuery(this).hasClass('well') && jQuery(this).hasClass('unselected')) || jQuery(this).hasClass('selected')){
				//solving class problems
				jQuery(this).removeClass('unselected');
				jQuery(this).addClass('selected');
				jQuery(this).siblings('.well').removeClass('selected');
				jQuery(this).siblings('.well').addClass('unselected');
				jQuery(this).siblings('.panel-collapse').addClass('close_it');
				jQuery(this).next().removeClass('close_it');
				var index = jQuery(this).attr('num');
				var current_family = object[index].family;
				if(fromSearch){
					var cat = [object[index].category];
					categories = cat;
					subset = "latin";
					
					var k = 0;
					for(i = 0 ; i < json_google.items.length; i++){
						if(jQuery.inArray(subset,json_google.items[i]['subsets'])!=-1){
							if(jQuery.inArray(json_google.items[i]['category'],categories)!=-1){
								k++;
								if(json_google.items[i]['family'] == current_family){
									index = k-1;
									break;
								}
									
							}
						}
					}
				} else {
					categories = object[index].category;
					subset = jQuery('#sbox-window .sub').find('select').val();
				}
	
				// adding button action

				var variant = jQuery(this).find('.custom_label span').attr('variant');
				
				var style_sub = variant.replace(/[0-9]/g, '');
				var weight_sub = variant.replace(/\D/g,'');
				if(style_sub == weight_sub){
					style_sub="normal";
				}
				if(weight_sub==""){
					weight_sub = "400";
				}
				if(style_sub == "" || style_sub == "regular"){
					style_sub = "normal";
				}
				smooth_scroll();
				newValHot = JSON.stringify({'fontFamily':current_family,'fontWeight':weight_sub,'fontStyle':style_sub,'googleFont':'yes', 'variant':variant, 'categories':categories, 'subset':subset,'index':index,'charsets':charsets});
				//newValHot = newValHot.replace(/'/g, '\\\'');	
			}
			else if(jQuery(this).is('input')){
				var num = jQuery(this).parents('.panel-collapse').prev().attr('num');
				setTimeout(function(){
					jQuery(".well[num='"+num+"']").trigger('click');
				},500);
			}
		});
			
		function loadFonts(){
			fromSearch = false;
			jQuery("#features .search_field").val("");
			var k = 0;
			for(i = 0 ; i < json_google.items.length; i++){
				if(jQuery.inArray(subset,json_google.items[i]['subsets'])!=-1){
					if(jQuery.inArray(json_google.items[i]['category'],categories)!=-1){
						object[k]=json_google.items[i];
						k++;
					}
				}
			}
		
			apendFonts2();
		};
		
		function loadFontsSearch(term){
			//OPTIONAL
			fromSearch = true;
			if(term==""){
				
				loadFonts();
				return;
			}
			var k = 0;
			for(i = 0 ; i < json_google.items.length; i++){	
				if(json_google.items[i]['family'].toLowerCase().indexOf(term.toLowerCase())>=0){
					object[k]=json_google.items[i];
					k++;
				}
			}
			
			apendFonts2();
		};
		
		function apendFonts(){
			jQuery('#sbox-window .googleFontPreview').html("");
			for(i = 0; i < object.length; i++){
				var style_sub = object[i].variants[0].replace(/[0-9]/g, '');
				var weight_sub = object[i].variants[0].replace(/\D/g,'');
				if(style_sub == weight_sub){
					style_sub="normal";
				}
				if(weight_sub==""){
					weight_sub = "400";
				}
				if(style_sub == "" || style_sub == "regular"){
					style_sub = "normal";
				}
				jQuery('#sbox-window .googleFontPreview').append("<div class='well unselected' num='"+i+"'> <div><span style='font-weight: 900;'>"+object[i].family+"</span><div style='display: inline-block; margin-left: 20px;'><a href='#collapseList"+i+"' aria-expanded='true' data-toggle='collapse' aria-controls='collapseListGroup"+i+"'>"+object[i].variants.length+" Styles</a></div><span style='float: right;'><a data-toggle='tooltip' data-pop='tooltip_font"+i+"' data-placement='bottom' title='Charsets'>"+object[i].subsets.length+" Charsets</a></span></div><hr><div class='custom_label not_loaded'><p>"+weights[weight_sub]+"  "+weight_sub+" "+(style_sub == "normal" ? "" : style_sub)+"</p><span style='font-family:"+object[i].family+"; font-style:"+style_sub+"; font-size:28px; font-weight:"+parseInt(weight_sub)+";' variant='"+object[i].variants[0]+"'>Wizard boy Jack loves the grumpy Queen's fox.</div></div><div id='collapseList"+i+"' class='panel-collapse collapse' role='tabpanel' aria-expanded='true'></div>");
			}
			
			for(i = 0; i < object.length; i++){
				jQuery("#sbox-window .googleFontPreview #collapseList"+i+"").append("<p style='font-weight: 900;'>"+object[i].family+" <span style='font-weight: 400;'>"+object[i].variants.length+" Styles "+object[i].subsets.length+" Charsets</span></p>");
				for(k = 0; k < object[i].variants.length; k++){
					var style_sub = object[i].variants[k].replace(/[0-9]/g, '');
					var weight_sub = object[i].variants[k].replace(/\D/g,'');
					if(style_sub == weight_sub){
						style_sub="normal";
					}
					if(weight_sub==""){
						weight_sub = "400";
					}
					if(style_sub == "" || style_sub == "regular"){
						style_sub = "normal";
					}
					if(k==0){
						jQuery("#sbox-window .googleFontPreview #collapseList"+i+"").append("<div class='checkbox'><p>"+weights[weight_sub]+"  "+weight_sub+" "+(style_sub == "normal" ? "" : style_sub)+"</p><input type='checkbox' value='"+object[i].variants[k]+"' checked='checked'><span style='font-family:"+object[i].family+"; font-style:"+style_sub+"; font-size:22px; font-weight:"+parseInt(weight_sub)+";'  variant='"+object[i].variants[k]+"'>Wizard boy Jack loves the grumpy Queen's fox.</span></div>");
					}
					else{
						jQuery("#sbox-window .googleFontPreview #collapseList"+i+"").append("<div class='checkbox'><p>"+weights[weight_sub]+"  "+weight_sub+" "+(style_sub == "normal" ? "" : style_sub)+"</p><input type='checkbox' value='"+object[i].variants[k]+"'><span style='font-family:"+object[i].family+"; font-style:"+style_sub+"; font-size:22px; font-weight:"+parseInt(weight_sub)+";'  variant='"+object[i].variants[k]+"'>Wizard boy Jack loves the grumpy Queen's fox.</span></div>");
					}
				}
				
			}
		};
		
		
		function renderFont(){
			var fontStringAll=[];
			
			jQuery('#sbox-window .googleFontPreview div.well').each(function(){
				
				if(jQuery(this).visible()){	
					var i = jQuery(this).attr("num");
					var fontString = "";
					fontString+= object[i].family.replace(/\s/g,"+");
					fontString+= ":";
					var k=0;
					for(k = 0; k<object[i].variants.length-1; k++){
						fontString+=object[i].variants[k]+",";
					}
					fontString+=object[i].variants[k];
					fontStringAll.push(fontString);
					
					jQuery(this).find('.custom_label').removeClass("not_loaded");
					
				}
				
			});
			
			if(fontStringAll.length > 0){
					WebFont.load({
						google: { 
							families: fontStringAll 
					} 
				}); 
			}
			
			for(i = 0; i < object.length; i++){
				if(jQuery("#sbox-window .googleFontPreview .well[num="+i+"]").find("div[id='tooltip_font"+i+"']").length>=1)
					continue;
				var prepared_tooltip = "";
				for(k = 0; k < object[i].subsets.length; k++){
					if(object[i].subsets[k]!="latin")
						prepared_tooltip+="<input type='checkbox' text='"+object[i].subsets[k]+"'>"+object[i].subsets[k]+"<br>";
					else
						prepared_tooltip+="<input type='checkbox' checked='checked' text='"+object[i].subsets[k]+"'>"+object[i].subsets[k]+"<br>";
				}
				jQuery("#sbox-window .googleFontPreview .well[num="+i+"]").append("<div style='display: none;' id='tooltip_font"+i+"' class='hidden_checkbox'>"+prepared_tooltip+"</div>");
			}
			
			
			jQuery('#sbox-content .googleFontPreview [data-toggle="tooltip"]').popover({
				delay: { show: 500, hide: 0 },
				placement: 'bottom',
				trigger: 'click',
				html: true,
				content: function() {
					
					
					var pop_dest = jQuery(this).attr("data-pop");
					return jQuery("#"+pop_dest).html();
				}
			});
		};	
		
		jQuery(document).on('change',"#features .search_field",function(){
			categories = jQuery('#features .cat').find('select').val();
			subset = jQuery('#features .sub').find('select').val();
			object = [];
			
			loadFontsSearch(jQuery(this).val());
			
			renderFont2();
			
			jQuery("#features .googleFontPreview")[0].onscroll = function(){
				jQuery('#features .googleFontPreview [data-toggle="tooltip"]').popover('hide');
				jQuery('#features .in.close_it').collapse('hide');
			
				setTimeout(function(){
					renderFont2();
				},100);
				
			}
			
			jQuery("#sbox-content")[0].onscroll = function(){
				jQuery('#sbox-content .googleFontPreview  [data-toggle="tooltip"]').popover('hide');
				jQuery('#sbox-content .in.close_it').collapse('hide');
				
				setTimeout(function(){
					renderFont2();
				},100);
				
			}
		});

		// Features script
		
		var googleFonts = JSON.parse(jQuery("#jform_params_googleUrl").val());
		
		var keys = Object.keys(googleFonts);
		if(keys.length>0){		
			jQuery(".selected_fonts .note").text("Fonts that are already included:");
			for(i = 0; i< keys.length; i++){
				jQuery(".selected_fonts").append("<input type='checkbox' value='"+keys[i]+"'>"+keys[i]+"<br>")
			}
		}
		else{
			jQuery('.selected_fonts').next('button').attr("disabled","");
			jQuery(".selected_fonts .note").text("No fonts selected");
		}
		
		jQuery(document).on('click','#features .well, #features .panel-collapse.show input[type="checkbox"]', function(){
			
			if((jQuery(this).hasClass('well') && jQuery(this).hasClass('unselected')) || jQuery(this).hasClass('selected')){
				// solving class problems
				jQuery(this).removeClass('unselected');
				jQuery(this).addClass('selected');
				jQuery(this).siblings('.well').removeClass('selected');
				jQuery(this).siblings('.well').addClass('unselected');
				jQuery(this).siblings('.panel-collapse').addClass('close_it');
				jQuery(this).next().removeClass('close_it');
				var index = jQuery(this).attr('num');
				var current_family = object[index].family;
			
				categories = object[index].category;
				subset = jQuery('#features .sub').find('select').val();
				
				var charsets = [];
				jQuery("#tooltip_font2"+index).first().find("input[checked='checked']").each(function(){
					charsets.push(jQuery(this).attr("text"));
				});
				
				var variants = [];
				jQuery("#collapseList2"+index).find("input:checked").each(function(){
					variants.push(jQuery(this).val());
				});
			
				// adding button action

				var variant = jQuery(this).find('.custom_label span').attr('variant');
				
				var style_sub = variant.replace(/[0-9]/g, '');
				var weight_sub = variant.replace(/\D/g,'');
				if(style_sub == weight_sub){
					style_sub="normal";
				}
				if(weight_sub==""){
					weight_sub = "400";
				}
				if(style_sub == "" || style_sub == "regular"){
					style_sub = "normal";
				}
			
				//smooth_scroll();
				newValHot = JSON.stringify({'fontFamily':current_family,'fontWeight':weight_sub,'fontStyle':style_sub,'googleFont':'no', 'variant':variants, 'categories':categories, 'subset':subset,'index':index,'charsets':charsets});
		
			}
			else if(jQuery(this).is('input')){
				var num = jQuery(this).parents('.panel-collapse').prev().attr('num');
				setTimeout(function(){
					jQuery(".well[num='"+num+"']").trigger('click');
				},500);
			}
			
		});
		
		jQuery(document).on("change","#category, #subset",function(){
			object = [];
			categories = jQuery('#features .cat').find('select').val();
			subset = jQuery('#features .sub').find('select').val();
			var k = 0;
			for(i = 0 ; i < json_google.items.length; i++){
				if(jQuery.inArray(subset,json_google.items[i]['subsets'])!=-1){
					if(jQuery.inArray(json_google.items[i]['category'],categories)!=-1){
						object[k]=json_google.items[i];
						k++;
					}
				}
			}
		
			apendFonts2();
			renderFont2();
			
			jQuery("#features .googleFontPreview")[0].onscroll = function(){
				jQuery('#features .googleFontPreview [data-toggle="tooltip"]').popover('hide');
				jQuery('#features .in.close_it').collapse('hide');
			
				setTimeout(function(){
					renderFont2();
				},100);
				
			}
		});
		
		function apendFonts2(){
			jQuery('#features .googleFontPreview').html("");
			for(i = 0; i < object.length; i++){
				var style_sub = object[i].variants[0].replace(/[0-9]/g, '');
				var weight_sub = object[i].variants[0].replace(/\D/g,'');
				if(style_sub == weight_sub){
					style_sub="normal";
				}
				if(weight_sub==""){
					weight_sub = "400";
				}
				if(style_sub == "" || style_sub == "regular"){
					style_sub = "normal";
				}
				jQuery('#features .googleFontPreview').append("<div class='well unselected' num='"+i+"'> <div><span style='font-weight: 900;'>"+object[i].family+"</span><div style='display: inline-block; margin-left: 20px;'><a href='#collapseList2"+i+"' aria-expanded='true' data-toggle='collapse' aria-controls='collapseList2Group"+i+"'>"+object[i].variants.length+" Styles</a></div><span style='float: right;'><a data-toggle='tooltip' data-pop='tooltip_font2"+i+"' data-placement='bottom' title='Charsets'>"+object[i].subsets.length+" Charsets</a></span></div><hr><div class='custom_label not_loaded'><p>"+weights[weight_sub]+"  "+weight_sub+" "+(style_sub == "normal" ? "" : style_sub)+"</p><span style='font-family:"+object[i].family+"; font-style:"+style_sub+"; font-size:28px; font-weight:"+parseInt(weight_sub)+";' variant='"+object[i].variants[0]+"'>Wizard boy Jack loves the grumpy Queen's fox.</div></div><div id='collapseList2"+i+"' class='panel-collapse collapse' role='tabpanel' aria-expanded='true'></div>");
			}
			
			for(i = 0; i < object.length; i++){
				jQuery("#features .googleFontPreview #collapseList2"+i+"").append("<p style='font-weight: 900;'>"+object[i].family+" <span style='font-weight: 400;'>"+object[i].variants.length+" Styles "+object[i].subsets.length+" Charsets</span></p>");
				for(k = 0; k < object[i].variants.length; k++){
					
					var style_sub = object[i].variants[k].replace(/[0-9]/g, '');
					var weight_sub = object[i].variants[k].replace(/\D/g,'');
					if(style_sub == weight_sub){
						style_sub="normal";
					}
					if(weight_sub==""){
						weight_sub = "400";
					}
					if(style_sub == "" || style_sub == "regular"){
						style_sub = "normal";
					}
					if(k == 0){
						jQuery("#features .googleFontPreview #collapseList2"+i+"").append("<div class='checkbox'><p>"+weights[weight_sub]+"  "+weight_sub+" "+(style_sub == "normal" ? "" : style_sub)+"</p><input type='checkbox' value='"+object[i].variants[k]+"' checked='checked'><span style='font-family:"+object[i].family+"; font-style:"+style_sub+"; font-size:22px; font-weight:"+parseInt(weight_sub)+";'  variant='"+object[i].variants[k]+"'>Wizard boy Jack loves the grumpy Queen's fox.</span></div>");
					}
					else{
						jQuery("#features .googleFontPreview #collapseList2"+i+"").append("<div class='checkbox'><p>"+weights[weight_sub]+"  "+weight_sub+" "+(style_sub == "normal" ? "" : style_sub)+"</p><input type='checkbox' value='"+object[i].variants[k]+"'><span style='font-family:"+object[i].family+"; font-style:"+style_sub+"; font-size:22px; font-weight:"+parseInt(weight_sub)+";'  variant='"+object[i].variants[k]+"'>Wizard boy Jack loves the grumpy Queen's fox.</span></div>");
					}
				}
				
			}
		};
		
		function renderFont2(){
			var fontStringAll=[];
			
			jQuery('#features .googleFontPreview div.well').each(function(){
				
				if(jQuery(this).visible()){	
					var i = jQuery(this).attr("num");
					var fontString = "";
					fontString+= object[i].family.replace(/\s/g,"+");
					fontString+= ":";
					var k=0;
					for(k = 0; k<object[i].variants.length-1; k++){
						fontString+=object[i].variants[k]+",";
					}
					fontString+=object[i].variants[k];
					fontStringAll.push(fontString);
					
					jQuery(this).find('.custom_label').removeClass("not_loaded");
					
				}
				
			});
			if(fontStringAll.length > 0){
					WebFont.load({
						google: { 
							families: fontStringAll 
					} 
				}); 
			}
			
			for(i = 0; i < object.length; i++){
				if(jQuery("#sbox-window .googleFontPreview .well[num="+i+"]").find("div[id='tooltip_font2"+i+"']").length>=1)
					continue;
				var prepared_tooltip = "";
				for(k = 0; k < object[i].subsets.length; k++){
					if(object[i].subsets[k]!="latin")
						prepared_tooltip+="<input type='checkbox' text='"+object[i].subsets[k]+"'>"+object[i].subsets[k]+"<br>";
					else
						prepared_tooltip+="<input type='checkbox' checked='checked' text='"+object[i].subsets[k]+"'>"+object[i].subsets[k]+"<br>";
				}
				jQuery("#features .googleFontPreview .well[num="+i+"]").append("<div style='display: none;' id='tooltip_font2"+i+"' class='hidden_checkbox'>"+prepared_tooltip+"</div>");
			}
			
			
			jQuery('#features .googleFontPreview [data-toggle="tooltip"]').popover({
				delay: { show: 500, hide: 0 },
				placement: 'bottom',
				trigger: 'click',
				html: true,
				content: function() {
					
					
					var pop_dest = jQuery(this).attr("data-pop");
					return jQuery("#"+pop_dest).html();
				}
			});
		};	
		
});
// End Google fonts

// Row settings

function initializeForSettings(){
	jQuery('.hasTooltip').tooltip({"html": true,"container": "body", "tooltipClass" : "new_one"});
	
	setTimeout(function(){			
		jQuery('#sbox-window ul.flipyesno').each(function(ind){
			var obj = jQuery(this).prev();
			var flip_obj = jQuery(jQuery(this));
			flip_obj.disableSelection();

			flip_obj.find('LI').click(function(){
				if(parseInt(jQuery(this).css('left')) == 0){
					jQuery(this).animate({left:'-55px'},300);
					obj.val(0);
				}else{
					jQuery(this).animate({left:'0px'},300);
					obj.val(1);
				}
			}).disableSelection(); 
		});
	},500);
	
	setTimeout(function(){	
		SqueezeBox.initialize({})
		SqueezeBox.assign(jQuery('a.modal.background').get(), {
			parse: 'rel'
		});	
	},1000);
};
var settings_row_index = 0;
var layout_object = {};

function saveSettingsParams(){
	var temp_settings= {} ;
	
	temp_settings.p1 = jQuery('#sbox-window .settings_name').val();
	temp_settings.p2 = jQuery('#sbox-window .settings_class').val();
	temp_settings.p3 = jQuery('#sbox-window .settings_heading').val();
	temp_settings.p4 = jQuery('#sbox-window .minicolors-input').val();
	temp_settings.p5 = jQuery('#sbox-window .flipyesno.equal_cells_width').val();
	temp_settings.p6 = jQuery("#sbox-window .vertical_align").val();
	temp_settings.p7 = jQuery("#sbox-window .horizontal_align").val();
	temp_settings.p8 = jQuery("#sbox-window .image_repeat").val();
	temp_settings.p9 = jQuery('#sbox-window .flipyesno.fixed_background').val();
	temp_settings.p10 = jQuery('#sbox-window .minicolors-input').val();
	temp_settings.p11 = jQuery('#sbox-window .flipyesno.parallax').val();
	temp_settings.p12 = jQuery("#sbox-window .scroll_speed").val();
	temp_settings.p13 = jQuery('#sbox-window .flipyesno.collapse').val();
	temp_settings.p14 = jQuery('#sbox-window .flipyesno.full').val();
	temp_settings.p15 = jQuery('#sbox-window .flipyesno.floating').val();
	temp_settings.p16 = jQuery("#sbox-window .settings_image").val();
	temp_settings.p17 = jQuery('#sbox-window .background_size').val();
	temp_settings.p18 = jQuery('#sbox-window .container_type').val();
	temp_settings.p19 = jQuery('#sbox-window .settings_subheading').val();
	
	var settings_name = "row"+settings_row_index;
	
	jQuery("#sortable .edit_row:nth-child("+settings_row_index+")").attr("layout_settings",JSON.stringify(temp_settings));
	layout_object[settings_name].settings = temp_settings;
	jQuery('#jform_params_layoutdesign').trigger('change');

}

jQuery(document).ready(function(){
	
	var settings_current = {};
	
	setTimeout(function(){	
		SqueezeBox.initialize({});
		SqueezeBox.assign(jQuery('a.modal').get(), {
			parse: 'rel'
		});
	},500);	
	
	// color picker with predefined colors
	setTimeout(function(){	
		jQuery('input.predefinedcolor').minicolors({swatches: [sparkycolor1, sparkycolor2, sparkycolor3, sparkycolor4, sparkycolor5, sparkycolor6], theme: 'bootstrap'});
	},500);

	// update all colors when a predefined colors is changed
	function updatePredefinedColor(){

		var sparkycolorvalue = [];

		for (let i=1; i<7; i++) {

			sparkycolorvalue[i] = jQuery('input#jform_params_sparkycolor'+i).val().toLowerCase();
			jQuery('input#jform_params_sparkycolor'+i).on('focusout', function(){

				// colors in rows settings
				var number_of_rows = Object.keys(layout_object).length;

				for (let j=1; j<=number_of_rows; j++) {

					if (jQuery('#sortable .edit_row:nth-child('+j+')').attr('layout_settings').includes(sparkycolorvalue[i])) {
						jQuery('#sortable .edit_row:nth-child('+j+')').attr('layout_settings', jQuery('#sortable .edit_row:nth-child('+j+')').attr('layout_settings').replace(sparkycolorvalue[i], jQuery('input#jform_params_sparkycolor'+i).val()));
					}

				}				

				// colors in template settings and menus settings
				jQuery('input.predefinedcolor').each(function(){
					if (sparkycolorvalue[i] === jQuery(this).val()) {

						var updatedColor = jQuery(this);

						setTimeout(function(){
							updatedColor.val(jQuery('input#jform_params_sparkycolor'+i).val());
							updatedColor.siblings(".minicolors-swatch").children(".minicolors-swatch-color").css("background-color", jQuery('input#jform_params_sparkycolor'+i).val());
						}, 1000);

					}
					
				});
				sparkycolorvalue[i] = jQuery('input#jform_params_sparkycolor'+i).val();

				regenerateColors();

			});
		}
	}
	updatePredefinedColor();

	// change color palette
	var sparkyPalleteOld = [ jQuery("#jform_params_sparkycolor1").val(), jQuery("#jform_params_sparkycolor2").val(), jQuery("#jform_params_sparkycolor3").val(), jQuery("#jform_params_sparkycolor4").val(), jQuery("#jform_params_sparkycolor5").val(), jQuery("#jform_params_sparkycolor6").val()];

	jQuery("#jform_params_templateStyle").change(function(){		
		
		var sparkyPalleteNew = jQuery("#jform_params_palette"+jQuery(this).val()).val().split(",");

		// change predefined template colors
		for (let i=1; i<7; i++) {

			jQuery("#jform_params_sparkycolor"+i).val(sparkyPalleteNew[i-1]).siblings(".minicolors-swatch").children(".minicolors-swatch-color").css("background-color", sparkyPalleteNew[i-1]);

			regenerateColors();

		}

		// change other colors
		let i = 0;
		sparkyPalleteOld.forEach(function(color){

			color = color.toLowerCase();
			sparkyPalleteNew[i] = sparkyPalleteNew[i].toLowerCase();

			// colors in template settings and menus settings
			jQuery('input.predefinedcolor').each(function(){
				if ( color === jQuery(this).val() ) {
					jQuery(this).val(sparkyPalleteNew[i]);
					jQuery(this).siblings(".minicolors-swatch").children(".minicolors-swatch-color").css("background-color", sparkyPalleteNew[i]);
				}
			});

			// colors in rows settings
			var number_of_rows = Object.keys(layout_object).length;

			for (let j=1; j<=number_of_rows; j++) {

				if (jQuery('#sortable .edit_row:nth-child('+j+')').attr('layout_settings').includes(color)) {
					jQuery('#sortable .edit_row:nth-child('+j+')').attr('layout_settings', jQuery('#sortable .edit_row:nth-child('+j+')').attr('layout_settings').replace(color, sparkyPalleteNew[i]));
				}

			}

			i++;
		});
		updatePredefinedColor();
	});

	// regenerate color pickers
	function regenerateColors(){
		sparkycolor1 = jQuery('input#jform_params_sparkycolor1').val();
		sparkycolor2 = jQuery('input#jform_params_sparkycolor2').val();
		sparkycolor3 = jQuery('input#jform_params_sparkycolor3').val();
		sparkycolor4 = jQuery('input#jform_params_sparkycolor4').val();
		sparkycolor5 = jQuery('input#jform_params_sparkycolor5').val();
		sparkycolor6 = jQuery('input#jform_params_sparkycolor6').val();

		jQuery('input.predefinedcolor').minicolors('destroy');
		jQuery('input.predefinedcolor').minicolors({swatches: [sparkycolor1, sparkycolor2, sparkycolor3, sparkycolor4, sparkycolor5, sparkycolor6], theme: 'bootstrap'});
	}

	jQuery(document).on("mousedown",".modal.btn.settings",function(){
		settings_row_index = jQuery('.modal.btn.settings').index(this);
		window.mini_settings();
		
		if(jQuery('#jform_params_layoutdesign').val()!="")
			layout_object = JSON.parse(jQuery('#jform_params_layoutdesign').val());
		else
			layout_object = JSON.parse("{}");
		

		var settings_name = "row"+settings_row_index;
		
		settings_current = JSON.parse(jQuery("#sortable .edit_row:nth-child("+settings_row_index+")").attr("layout_settings"));

		setTimeout(function(){

			// text inputs

			jQuery('#sbox-window .settings_name').val(settings_current.p1);
			jQuery('#sbox-window .settings_class').val(settings_current.p2);
			jQuery('#sbox-window .settings_heading').val(settings_current.p3);
			jQuery('#sbox-window .settings_subheading').val(settings_current.p19);
			jQuery('#sbox-window .background_size').val(settings_current.p17);
			
			// minicolors picker

			if(settings_current.p4==""){
				jQuery('#sbox-window .minicolors-input').val("");
			}
			else{
				jQuery('#sbox-window .minicolors-input').val(settings_current.p4);
			}
			window.mini_settings();

			// lists

			if(settings_current.p6!="")
				jQuery("#sbox-window .vertical_align").val(settings_current.p6).trigger('liszt:updated');
				
			if(settings_current.p7!="")
				jQuery("#sbox-window .horizontal_align").val(settings_current.p7).trigger('liszt:updated');
			
			if(settings_current.p8!="")
				jQuery("#sbox-window .image_repeat").val(settings_current.p8).trigger('liszt:updated');

			if(settings_current.p12!="")
				jQuery("#sbox-window .scroll_speed").val(settings_current.p12).trigger('liszt:updated');
			
			if(settings_current.p16!="")
				jQuery("#sbox-window .settings_image").val(settings_current.p16).trigger('liszt:updated');

			if(settings_current.p18!="")
				jQuery("#sbox-window .container_type").val(settings_current.p18).trigger('liszt:updated');
			
			// flip yes/no

			if(settings_current.p5=="" || settings_current.p5=="0"){
				jQuery('#sbox-window .flipyesno.equal_cells_width').val(0);
			}
			else{
				jQuery('#sbox-window .flipyesno.equal_cells_width').val(1).next().find('li').trigger('click');
			}
			
			if(settings_current.p9=="" || settings_current.p9=="0"){
				jQuery('#sbox-window .flipyesno.fixed_background').val(0);
			}
			else{
				jQuery('#sbox-window .flipyesno.fixed_background').val(1).next().find('li').trigger('click');
			}
			
			if(settings_current.p11=="" || settings_current.p11=="0"){
				jQuery('#sbox-window .flipyesno.parallax').val(0);
			}
			else{
				jQuery('#sbox-window .flipyesno.parallax').val(1).next().find('li').trigger('click');
			}
			
			if(settings_current.p13=="" || settings_current.p13=="0"){
				jQuery('#sbox-window .flipyesno.collapse').val(0);
			}
			else{
				jQuery('#sbox-window .flipyesno.collapse').val(1).next().find('li').trigger('click');
			}
			
			if(settings_current.p14=="" || settings_current.p14=="0"){
				jQuery('#sbox-window .flipyesno.full').val(0);
			}
			else{
				jQuery('#sbox-window .flipyesno.full').val(1).next().find('li').trigger('click');
			}
			
			if(settings_current.p15=="" || settings_current.p15=="0"){
				jQuery('#sbox-window .flipyesno.floating').val(0);
			}
			else{
				jQuery('#sbox-window .flipyesno.floating').val(1).next().find('li').trigger('click');
			}
			
		},900);
	});

	// open and switch the tabs
	jQuery("#fieldset-features .control-group.field-spacer, #fieldset-fontsettings .control-group.field-spacer").on("mousedown", function(){

		if (jQuery(this).hasClass("active")) {
			jQuery(this).toggleClass("active");

			jQuery("#fieldset-features .control-group:not(.field-spacer), #fieldset-fontsettings .control-group:not(.field-spacer)").each(function(){
				jQuery(this).hide();
			});
		} else {

			jQuery("#fieldset-features .control-group.field-spacer.active, #fieldset-fontsettings .control-group.field-spacer.active").each(function(){
				jQuery(this).toggleClass("active");
			});

			jQuery(this).toggleClass("active");

			jQuery("#fieldset-features .control-group:not(.field-spacer), #fieldset-fontsettings .control-group:not(.field-spacer)").each(function(){
				jQuery(this).hide();
			});

			let currentTab = jQuery(this);
			for (var i = 0; i < 100; i++) {
				currentTab = currentTab.next();
				if(!currentTab.hasClass( "field-spacer" )) {
					currentTab.show();
				}else{
					break;
				}
			}
		}
	});

	// if parent template, and not default, hide the tabs

	if (jQuery("h2:contains('sparky_framework')").length > 0 && jQuery("input#jform_home0").attr("checked")) {
		jQuery("button[aria-controls='attrib-layoutdesign']").hide();
		jQuery("button[aria-controls='attrib-fontsettings']").hide();
		jQuery("button[aria-controls='attrib-features']").hide();
		jQuery("button[aria-controls='attrib-menuconfig']").hide();
		jQuery("button[aria-controls='attrib-mobileoptions']").hide();
		jQuery("button[aria-controls='attrib-mobileoptions']").hide();
		jQuery("button[aria-controls='attrib-customcode']").hide();
		jQuery("button[aria-controls='attrib-exportoptions']").hide();
		alert("This is the parent template. The template settings are in the child template(s).\n\nIf you are not using the child templates, make this template style as default and the settings will be unlocked (after saving).");
	}

});