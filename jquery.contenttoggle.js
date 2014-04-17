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
    collapsedHeight: 200,
    collapseText: "Show Less",
    expandText: "Show More",
    handleResize: true,
    pretoggled_callback: function($el, toggleState, callback) {
      callback();
    },
    toggled_callback: function($el, toggleState) {}
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
    // If the height of the element is less than the collapsed height + 75px 
    // then remove the plug-in if it as already applied or don't bother 
    // applying it if it hasn't yet been applied.
    //

    var height = this.$el.height();

    if (height < this.options.collapsedHeight + 75) {
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
        this.options.expandText,
      '</a>'
    ].join(''));

    //
    // Bind event handlers
    //

    $contentToggleWrapper
      .siblings(".js-content-toggle-link")
      .on("click." + pluginName, $.proxy(this._contentToggleLink_click, this));

    if (this.options.handleResize) {
      $(window).on("resize." + pluginName, $.proxy(this._window_resize, this));
    }

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
   * @description Remove all generated content and event handlers and data. 
   */
  $.ContentToggle.prototype.destroy = function() { 
    if (this.$el.parent().hasClass("js-content-toggle-wrapper")) {
      this.$el.unwrap();
    }
    
    this.$el.siblings(".js-content-toggle-gradient").remove();
    this.$el.siblings(".js-content-toggle-link").off("click." + pluginName).remove();

    if (this.options.handleResize) {
      $(window).off("resize." + pluginName);
    }

    this.$el.removeData(pluginName);
  };

  /** 
   * @description When the window has resized we need obtain the origially 
   * requested collapsed height and then reinitialize the plug-in.
   */
  $.ContentToggle.prototype.resize = function() {
    this.init(this.options);

    // When we call init() to resize ourself, the original instance of ourself
    // that was saved on the element may have been removed.  So if it was, we
    // need to add it back!

    if (! this.$el.data(pluginName)) {
      this.$el.data(pluginName, this);
    }
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
    resizeTimeout = window.setTimeout(function() { self.resize(e); }, 150);
  };

  /**
   * @description Expand/collapse the content toggled content to show or hide it.
   */
  $.ContentToggle.prototype._contentToggleLink_click = function(e) { 

    e.preventDefault();
    e.stopImmediatePropagation();

    var toggleState = "";
    var $contentToggleLink = $(e.target);
    var $contentToggleGradient = $contentToggleLink.siblings(".js-content-toggle-gradient");
    var $contentToggleWrapper = $contentToggleLink.siblings(".js-content-toggle-wrapper");

    if ($contentToggleLink.hasClass("js-show-more")) {
      toggleState = "more";
    }
    else { 
      toggleState = "less";
    }

    var fCallback = function() { 
      if (toggleState === "more") {
        $contentToggleWrapper.css("height", $contentToggleWrapper.data("maxheight") + "px");
        $contentToggleGradient.css("display", "none");
        $contentToggleLink
          .removeClass("js-show-more")
          .addClass("js-show-less")
          .html(this.options.collapseText);
      }
      else {
        $contentToggleWrapper.css("height", $contentToggleWrapper.data("minheight") + "px");
        $contentToggleGradient.css("display", "block");
        $contentToggleLink
          .removeClass("js-show-less")
          .addClass("js-show-more")
          .html(this.options.expandText);
      }

      this.options.toggled_callback(this.$el, toggleState);
    };

    this.options.pretoggled_callback(this.$el, toggleState, $.proxy(fCallback, this));
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
          self.init(options);

          // When reinitializing we call our destory method since it is easier
          // to remove our UI changes and then re-apply them.  In the process 
          // we lose the instance of ourself that we saved to the element.  So 
          // knowing that, we just save ourself to the element again here.
          
          $.data(this, pluginName, self); 
        }
        else {
          self = $.data(this, pluginName, new $.ContentToggle(options, this));
        }

      });
    }

    return this;
  };

})(jQuery);
