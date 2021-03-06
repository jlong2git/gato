jQuery(document).ready(function ($) {
  var sidebar = $('.page_content .sidebar');
  var pagecontent = $('.page_content');
  var footer = $('.footer');

  // prevent sidebar from flowing behind the footer,
  // since it is position: absolute
  var setsidebarminheight = function() {
    pagecontent.css('min-height', Math.max($(window).height()-pagecontent.offset().top-footer.height(), sidebar.height()+75)+'px');
  };
  resizeTimeout(setsidebarminheight);
  waitforselector('.navBlocks_add', '.mgnlEditor.mgnlPlaceholder', setsidebarminheight);

  if (sidebar.size() > 0) {
    // find the first gato-component paragraph whose top is
    // below the sidebar and expand it to full width
    resizeTimeout(function() {
      $('.page_content .gato-section').each(function (i, cmp) {
        cmp = $(cmp);
        if (cmp.position().top > sidebar.position().top+sidebar.height()) {
          cmp.css('width', '100%');
        } else {
          cmp.css('width', '');
        }
      });
    });
  }
});
