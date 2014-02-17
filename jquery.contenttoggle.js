/**
 * @description The content toggle plug-in is based on Amazon's psGradient 
 * element and styles. It is meant to be applied to an element that should have
 * its content toggled between being expanded and somewhat collapsed.  In the 
 * collapsed state there will be a transparent gradient overlaid on the content
 * that is hidden.  This plug-in requires styles in the the contenttoggle 
 * style sheet.
 * @see http://www.amazon.com/dp/B003F3PKUE
 */
(function($) {

  var pluginName = "contenttoggle";

  $.ContentToggle = function(options, element) {
    this.resizeTimeout = null;
  
    this.$el = $(element);
    this.init(options);
  };

  $.ContentToggle.defaults = {
    collapsedHeight: 200
  };


  // --------------------------------------------------------------------------
  // Public Methods
  // --------------------------------------------------------------------------

  $.ContentToggle.prototype.init = function(options) {

    this.options = $.extend(true, {}, $.ContentToggle.defaults, options);

    //
    // If the plug-in has already been applied then check to see if we need
    // to expand it, and then destroy the plug-in, since we'll add it back
    // shortly and we need the element's natural height for the next step.
    //

    var needToExpand = false;

    if (this.$el.data(pluginName)) {
      needToExpand = this.$el
                      .closest(".js-content-toggle-wrapper")
                      .siblings(".js-content-toggle-link")
                      .hasClass("js-show-less");
      
      this.destroy();
    }

    //
    // If the height of the element is less than the collapsed height then
    // remove the plug-in if it as already applied or don't bother applying 
    // it if it hasn't yet been applied.
    //

    var height = this.$el.height();

    if (height < this.options.collapsedHeight) {
      if (this.$el.data(pluginName)) { 
        this.destroy();
      }

      return;
    }

    //
    // Otherwise apply the plug-in
    //

    this.$el.wrap([
      '<div class="content-toggle-wrapper js-content-toggle-wrapper colllapsed" ' + 
        'data-maxheight="' + height + '" ' + 
        'data-minheight="' + this.options.collapsedHeight + '" ' + 
        'style="height:' + this.options.collapsedHeight + 'px;">',
      '</div>'].join(''));
    
    var $contentToggleWrapper = this.$el.closest(".js-content-toggle-wrapper");

    $contentToggleWrapper.after([
      '<div class="content-toggle-gradient js-content-toggle-gradient">',
      '</div>',
      '<a class="content-toggle-link js-content-toggle-link js-show-more" ' + 
        'href="javascript:void(0);">',
        Show More',
      '</a>'
    ].join(''));

    //
    // Bind event handlers
    //

    $contentToggleWrapper
      .siblings(".js-content-toggle-link")
      .on("click." + pluginName, $.proxy(this._contentToggleLink_click, this));
    $(window).on("resize." + pluginName, $.proxy(this._window_resize, this));

    //
    // If the plug-in has been re-applied and needs to be expanded because it
    // was expanded before being reapplied, then trigger an on click event to
    // expand it now.
    //

    if (needToExpand) {
      $contentToggleWrapper = this.$el.closest(".js-content-toggle-wrapper");
      $contentToggleLink = $contentToggleWrapper.siblings(".js-content-toggle-link");
      $contentToggleLink.trigger("click");
    }
  };

  /**
   * @description Remove all generated content and event handlers and return 
   * the original element.
   */
  $.ContentToggle.prototype.destroy = function() { 
    if (this.$el.parent().hasClass("js-content-toggle-wrapper")) {
      this.$el.unwrap();
    }
    
    this.$el.siblings(".js-content-toggle-gradient").remove();
    this.$el.siblings(".js-content-toggle-link").off("click." + pluginName).remove();

    $(window).off("resize." + pluginName);
  };


  // --------------------------------------------------------------------------
  // Event Handling Methods
  // --------------------------------------------------------------------------

  /**
   * @description Clear and set timeouts to catch the final window resize event
   * (aka debouncing) and then handle the last resize event.
   */
  $.ContentToggle.prototype._window_resize = function(e) { 
    var self = this;
    window.clearTimeout(this.resizeTimeout);
    resizeTimeout = window.setTimeout(function() { self._window_handleResize(e); }, 150);
  };

  /** 
   * @description When the window has resized we need obtain the origially 
   * requested collapsed height and then reinitialize the plug-in.
   */
  $.ContentToggle.prototype._window_handleResize = function() {
    
    // TODO: When there are multiple ContentToggle instances on the same page
    // we see the resize event triggered not just when the window orientation
    // changes thus triggering a resize event but also when the other 
    // ContentToggle elements on the page are resized.  We should NOT handle
    // those resize events as they cause the resize events to be triggered over
    // and over again!

    // console.log("$.ContentToggle._window_handleResize(): Called for " + this.$el.attr("id"));

    var collapsedHeight = this.$el.closest(".js-content-toggle-wrapper").data("minheight");
    this.init({ collapsedHeight: collapsedHeight });
  };

  /**
   * @description Expand/collapse the content toggled content to show or hide it.
   */
  $.ContentToggle.prototype._contentToggleLink_click = function(e) { 

    e.preventDefault();
    e.stopImmediatePropagation();

    var $contentToggleLink = $(e.target);
    var $contentToggleGradient = $contentToggleLink.siblings(".js-content-toggle-gradient");
    var $contentToggleWrapper = $contentToggleLink.siblings(".js-content-toggle-wrapper");

    if ($contentToggleLink.hasClass("js-show-more")) {
      $contentToggleWrapper.css("height", $contentToggleWrapper.data("maxheight") + "px");
      $contentToggleGradient.css("display", "none");
      $contentToggleLink
        .removeClass("js-show-more")
        .addClass("js-show-less")
        .html("Show Less");
    }
    else {
      $contentToggleWrapper.css("height", $contentToggleWrapper.data("minheight") + "px");
      $contentToggleGradient.css("display", "block");
      $contentToggleLink
        .removeClass("js-show-less")
        .addClass("js-show-more")
        .html("Show More");
    }
  };


  var logError = function(message) {
    if (window.console) {
      window.console.error(message);
    }
  };


  // --------------------------------------------------------------------------
  // Plug In Definition
  // --------------------------------------------------------------------------

  $.fn.contenttoggle = function(options) {

    if (typeof options === 'string') {
      var args = Array.prototype.slice.call(arguments, 1);

      this.each(function() {
        var self = $.data(this, pluginName);
        
        if (!self) {
          logError(
            "Cannot call methods on " + pluginName + " " +
            "prior to initialization; " +
            "attempted to call method '" + options + "'" 
          );
          return;
        }

        if (!$.isFunction(self[options]) || options.charAt(0) === "_" ) {
          logError("No such method '" + options + "' for " + pluginName);
          return;
        }

        self[options].apply(self, args);  
      });
    }
    else {
      this.each(function() {
        var self = $.data(this, pluginName);

        if (self) {
          self.init();
        }
        else {
          self = $.data(this, pluginName, new $.ContentToggle(options, this));
        }

      });
    }

    return this;
  };

})(jQuery);
