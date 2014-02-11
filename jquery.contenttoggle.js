/**
 * @description The content toggle plug-in is based on Amazon's psGradient 
 * element and styles. It is meant to be applied to an element that should have
 * its content toggled between being expanded and somewhat collapsed.  In the 
 * collapsed state there will be a transparent gradient overlaid on the content
 * that is hidden.  This plug-in requires styles in the the content_toggle 
 * style sheet.
 * @see http://www.amazon.com/dp/B003F3PKUE
 */
(function($) {

  var pluginName = "jQuery.contenttoggle";

  /**
   * @description Initialize the content toggle plug-in.  Wrapping the element
   * in out toggle wrapper and adding the shim and expand/collapse link. 
   * @param options.collapsedHeight Optional parameter use to specify the 
   * collapsed height of the toggle wrapper.  Default value if not specified is
   * 200px.
   */
  var init = function(options) {

    // Use the specified collapsed height or default to 200px

    var collapsedHeight = options && options.collapsedHeight ? options.collapsedHeight : 200;
    collapsedHeight = parseInt(collapsedHeight, 10);
    collapsedHeight = isNaN(collapsedHeight) ? 200 : collapsedHeight;

    return this.each(function() {
      var $el = $(this);
      var height = $el.height();

      // If the height of the element is less than the collapsed height then
      // remove the plug-in if it as already applied or don't bother applying 
      // it if it hasn't yet been applied.

      if (height < collapsedHeight) {
        if ($el.closest(".js-content-toggle-wrapper").length) { 
          destroy.apply($el);
        }
        return;
      }

      // If the plug-in has already been applied then check to see if we need
      // to expand it, and then destroy the plug-in, since we'll add it back
      // shortly.

      var $contentToggleWrapper = null;
      var $contentToggleLink = null;
      var needToExpand = false;

      if ($el.parent().hasClass("js-content-toggle-wrapper")) {
        $contentToggleWrapper = $el.closest(".js-content-toggle-wrapper");
        $contentToggleLink = $contentToggleWrapper.siblings(".js-content-toggle-link");
        
        needToExpand = $contentToggleLink.hasClass("js-show-less");
        
        destroy.apply($el);
      }

      // Othersise apply the plug-in

      $el.wrap([
        '<div class="content-toggle-wrapper js-content-toggle-wrapper colllapsed" ' + 
          'data-maxheight="' + height + '" ' + 
          'data-minheight="' + collapsedHeight + '" ' + 
          'style="height:' + collapsedHeight + 'px;">',
        '</div>'].join(''));
      
      var $contentToggleWrapper = $el.closest(".js-content-toggle-wrapper");

      $contentToggleWrapper.after([
        '<div class="content-toggle-gradient js-content-toggle-gradient">',
        '</div>',
        '<a class="content-toggle-link js-content-toggle-link js-show-more" ' + 
          'href="javascript:void(0);">',
          '&#9660; Show All',
        '</a>'
      ].join(''));

      $contentToggleWrapper
        .siblings(".js-content-toggle-link")
        .on("click", contentToggleLink_click);

      // After applying the plug-in, if we re-applied it, and need to expand 
      // the content, we'll do so now.

      if (needToExpand) {
        $contentToggleWrapper = $el.closest(".js-content-toggle-wrapper");
        $contentToggleLink = $contentToggleWrapper.siblings(".js-content-toggle-link");
        $contentToggleLink.trigger("click");
      }
    });
  };

  /**
   * @description Remove all generated content and event handlers and return 
   * the original element.
   */
  var destroy = function() { 
    return this.each(function() {
      var $el = $(this);

      if ($el.parent().hasClass("js-content-toggle-wrapper")) {
        $el.unwrap();
      }
      
      $el.siblings(".js-content-toggle-gradient").remove();
      $el.siblings(".js-content-toggle-link")
        .off("click")
        .remove();
    });
  };

  var contentToggleLink_click = function(e) { 

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
        .html("&#9650; Show Less");
    }
    else {
      $contentToggleWrapper.css("height", $contentToggleWrapper.data("minheight") + "px");
      $contentToggleGradient.css("display", "block");
      $contentToggleLink
        .removeClass("js-show-less")
        .addClass("js-show-more")
        .html("&#9660; Show All");
    }
  };

  var methods = {
    "init": init,
    "destroy": destroy
  };

  $.fn.contenttoggle = function(method) {
    
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    else if (typeof method === "object" || !method) {
      return methods.init.apply(this, arguments);
    }
    else {
      $.error("Method " + method + " does not exist on " + pluginName + ".");
    } 
  };

})(jQuery);