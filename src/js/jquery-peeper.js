/*
 * jQuery-peeper -
 * Copyright (c) Miroslaw Sztorc <mr.sztorc@gmail.com>
 * Licensed under the MIT license.
 * See LICENSE file in the project root for details.
 */
;( function( $, window, document, undefined ) {

    "use strict";

    // Create the defaults once
    let pluginName = "peeper",
        defaults = {
            showEvent: 'mouseup',
            showElement: '',
            mask: true,
            maskOpacity: 1,
            autohide: true,
            autohideTime: 4000,
            maskCss: 'gray',
            showPasswordCss: 'fa fa-key',
            copyPasswordCss: 'fa fa-copy',
            showCopyBtn: true,
            showPasswordBtn: true,
            animateDuration: 300
        };

    // The actual plugin constructor
    function Plugin ( element, options ) {
        this.element = element;

        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this._autoHiding = false;
        this._container = null;
        this.init();
    }

    // Avoid Plugin.prototype conflicts
    $.extend( Plugin.prototype, {
        init: function() {
            this.peeperInit();
        },
        showPassword: function() {
            let pel = $(this.element);
            let _self = this;

            pel.attr("type", "text");

            if (this.settings.mask)
            {
                pel.prev('.peeper-mask').stop().animate({
                    width: "0",
                }, this.settings.animateDuration);
            }
        },
        hidePassword: function() {
            let pel = $(this.element);
            let _self = this;

            if (this.settings.mask)
            {
                pel.prev('.peeper-mask').stop().animate({
                    width: pel.outerWidth(),
                }, this.settings.animateDuration, function() {
                    pel.attr("type", "password");
                    if (_self._autoHiding) _self._autoHiding = false;
                });
            } else {
                pel.attr("type", "password");
            }
        },
        togglePasswordPeep: function() {

            let pel = $(this.element);

            if (pel.attr("type") == "password") {

                if (pel.prev('.peeper-mask').is(':animated'))
                    return;

                this.showPassword();
            } else {
                this.hidePassword();
            }
        },
        autoHide: function() {

            let _self = this;

            if (_self.settings.autohide === true)
            {
                if (_self._autoHiding)
                    return;

                _self._autoHiding = true;

                setTimeout(function() {
                    if ($(_self.element).is(':not(:focus)'))
                    {
                        _self.hidePassword();
                    }

                }, _self.settings.autohideTime);
            }
        },
        copyPassword: function() {
            let _ptmp = $('<input>');
            $('body').append(_ptmp);
            _ptmp.val($(this.element).val()).select();
            document.execCommand("copy");
            _ptmp.remove();

        },
        peeperInit: function() {

            $(this.element).wrap('<div class="peeper-container"></div>');
            this._container = $(this.element).parent();

            if (this.settings.showPasswordBtn)
                $(this.element).after('<span class="'+this.settings.showPasswordCss +' peeper-keyhole"></span>');

            if (this.settings.showCopyBtn)
                $(this.element).after('<span class="'+this.settings.copyPasswordCss +' peeper-copy-pass"></span>');

            if (this.settings.mask)
            {
                $(this.element).before('<div class="peeper-mask '+ this.settings.maskCss +'" style="opacity:'+this.settings.maskOpacity +'"></div>');
                $(this.element).prev('.peeper-mask').css({
                    'width': $(this.element).outerWidth(),
                    'height': $(this.element).outerHeight(),
                    'position': 'absolute',
                    'top': $(this.element).offsetTop,
                    'left': $(this.element).offsetLeft,
                    'border-radius': $(this.element).css('borderRadius')
                });
            }

            if (typeof this.settings.showElement == 'string' && this.settings.showElement == '')
                this.settings.showElement = $(this._container).find('.peeper-keyhole')
            else if (typeof this.settings.showElement == 'string' && this.settings.showElement == '.peeper-mask')
                this.settings.showElement = $(this._container).find('.peeper-mask')
            else
                $(this.settings.showElement);


            let _self = this;
            let pEvent = this.settings.showEvent.toLowerCase();

            switch(pEvent)
            {
                case 'mouseup':
                    this.settings.showElement.on('mouseup', function(e) {
                        _self.togglePasswordPeep();

                        $(this.element).blur();
                    }).on('mousedown', function(e) {
                        $(this.element).blur();
                        _self.togglePasswordPeep();
                    }).on('mouseleave', function() {
                        _self.hidePassword();
                    });
                    break;
                default:
                    this.settings.showElement.on(pEvent, function(e) {
                        _self.togglePasswordPeep();
                        _self.autoHide();
                        e.preventDefault();
                    });
            }

            if (this.settings.showCopyBtn)
            {
                $(this.element).next('.peeper-copy-pass').on('click', function(e) {
                    _self.copyPassword();
                });
            }

            $(this.element).on('blur', function(e) {
                _self.hidePassword();
            });
        }
    } );

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[ pluginName ] = function( options ) {
        return this.each( function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" +
                    pluginName, new Plugin( this, options ) );
            }
        } );
    };

} )( jQuery, window, document );
