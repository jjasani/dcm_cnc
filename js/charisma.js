$(document).ready(function() {
  //themes, change CSS with JS

  //ajax menu checkbox
  $("#is-ajax").click(function(e) {
    $.cookie("is-ajax", $(this).prop("checked"), { expires: 365 });
  });
  $("#is-ajax").prop("checked", $.cookie("is-ajax") === "true" ? true : false);

  //disbaling some functions for Internet Explorer
  if ($.browser.msie) {
    $("#is-ajax").prop("checked", false);
    $("#for-is-ajax").hide();
    $("#toggle-fullscreen").hide();
    $(".login-box")
      .find(".input-large")
      .removeClass("span10");
  }

  //highlight current / active link
  $("ul.main-menu li a").each(function() {
    if ($($(this))[0].href == String(window.location))
      $(this)
        .parent()
        .addClass("active");
  });

  //ajaxify menus
  $("a.ajax-link").click(function(e) {
    if ($.browser.msie) e.which = 1;
    if (
      e.which != 1 ||
      !$("#is-ajax").prop("checked") ||
      $(this)
        .parent()
        .hasClass("active")
    )
      return;
    e.preventDefault();
    if ($(".btn-navbar").is(":visible")) {
      $(".btn-navbar").click();
    }
    $("#loading").remove();
    $("#content")
      .fadeOut()
      .parent()
      .append(
        '<div id="loading" class="center">Loading...<div class="center"></div></div>'
      );
    var $clink = $(this);
    History.pushState(null, null, $clink.attr("href"));
    $("ul.main-menu li.active").removeClass("active");
    $clink.parent("li").addClass("active");
  });

  //animating menus on hover
  $("ul.main-menu li:not(.nav-header)").hover(
    function() {
      $(this).animate({ "margin-left": "+=5" }, 300);
    },
    function() {
      $(this).animate({ "margin-left": "-=5" }, 300);
    }
  );

  //other things to do on document ready, seperated for ajax calls
  docReady();
});

function docReady() {
  //prevent # links from moving to top
  $('a[href="#"][data-top!=true]').click(function(e) {
    e.preventDefault();
  });

  //datepicker
  $(".datepicker").datepicker({ dateFormat: "dd/mm/yy" });

  //uniform - styler for checkbox, radio and file input
  $("input:checkbox, input:radio, input:file")
    .not('[data-no-uniform="true"],#uniform-is-ajax')
    .uniform();

  //chosen - improves select
  $('[data-rel="chosen"],[rel="chosen"]').chosen();

  //makes elements soratble, elements that sort need to have id attribute to save the result
  $(".sortable").sortable({
    revert: true,
    cancel: ".btn,.box-content,.nav-header",
    update: function(event, ui) {
      //line below gives the ids of elements, you can make ajax call here to save it to the database
      //console.log($(this).sortable('toArray'));
    }
  });

  //iOS / iPhone style toggle switch
  $(".iphone-toggle").iphoneStyle();

  //datatable
  $(".datatable").dataTable({
    sDom:
      "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span12'i><'span12 center'p>>",
    sPaginationType: "bootstrap",
    order: [[0, "desc"]],
    oLanguage: {
      sLengthMenu: "_MENU_ records per page"
    }
  });
  $(".btn-close").click(function(e) {
    e.preventDefault();
    $(this)
      .parent()
      .parent()
      .parent()
      .fadeOut();
  });
  $(".btn-minimize").click(function(e) {
    e.preventDefault();
    var $target = $(this)
      .parent()
      .parent()
      .next(".box-content");
    if ($target.is(":visible"))
      $("i", $(this))
        .removeClass("icon-chevron-up")
        .addClass("icon-chevron-down");
    else
      $("i", $(this))
        .removeClass("icon-chevron-down")
        .addClass("icon-chevron-up");
    $target.slideToggle();
  });
  $(".btn-setting").click(function(e) {
    e.preventDefault();
    $("#myModal").modal("show");
  });
}

//additional functions for data table
$.fn.dataTableExt.oApi.fnPagingInfo = function(oSettings) {
  return {
    iStart: oSettings._iDisplayStart,
    iEnd: oSettings.fnDisplayEnd(),
    iLength: oSettings._iDisplayLength,
    iTotal: oSettings.fnRecordsTotal(),
    iFilteredTotal: oSettings.fnRecordsDisplay(),
    iPage: Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength),
    iTotalPages: Math.ceil(
      oSettings.fnRecordsDisplay() / oSettings._iDisplayLength
    )
  };
};
$.extend($.fn.dataTableExt.oPagination, {
  bootstrap: {
    fnInit: function(oSettings, nPaging, fnDraw) {
      var oLang = oSettings.oLanguage.oPaginate;
      var fnClickHandler = function(e) {
        e.preventDefault();
        if (oSettings.oApi._fnPageChange(oSettings, e.data.action)) {
          fnDraw(oSettings);
        }
      };

      $(nPaging)
        .addClass("pagination")
        .append(
          "<ul>" +
            '<li class="prev disabled"><a href="#">&larr; ' +
            oLang.sPrevious +
            "</a></li>" +
            '<li class="next disabled"><a href="#">' +
            oLang.sNext +
            " &rarr; </a></li>" +
            "</ul>"
        );
      var els = $("a", nPaging);
      $(els[0]).bind("click.DT", { action: "previous" }, fnClickHandler);
      $(els[1]).bind("click.DT", { action: "next" }, fnClickHandler);
    },

    fnUpdate: function(oSettings, fnDraw) {
      var iListLength = 5;
      var oPaging = oSettings.oInstance.fnPagingInfo();
      var an = oSettings.aanFeatures.p;
      var i,
        j,
        sClass,
        iStart,
        iEnd,
        iHalf = Math.floor(iListLength / 2);

      if (oPaging.iTotalPages < iListLength) {
        iStart = 1;
        iEnd = oPaging.iTotalPages;
      } else if (oPaging.iPage <= iHalf) {
        iStart = 1;
        iEnd = iListLength;
      } else if (oPaging.iPage >= oPaging.iTotalPages - iHalf) {
        iStart = oPaging.iTotalPages - iListLength + 1;
        iEnd = oPaging.iTotalPages;
      } else {
        iStart = oPaging.iPage - iHalf + 1;
        iEnd = iStart + iListLength - 1;
      }

      for (i = 0, iLen = an.length; i < iLen; i++) {
        // remove the middle elements
        $("li:gt(0)", an[i])
          .filter(":not(:last)")
          .remove();

        // add the new list items and their event handlers
        for (j = iStart; j <= iEnd; j++) {
          sClass = j == oPaging.iPage + 1 ? 'class="active"' : "";
          $("<li " + sClass + '><a href="#">' + j + "</a></li>")
            .insertBefore($("li:last", an[i])[0])
            .bind("click", function(e) {
              e.preventDefault();
              oSettings._iDisplayStart =
                (parseInt($("a", this).text(), 10) - 1) * oPaging.iLength;
              fnDraw(oSettings);
            });
        }

        // add / remove disabled classes from the static elements
        if (oPaging.iPage === 0) {
          $("li:first", an[i]).addClass("disabled");
        } else {
          $("li:first", an[i]).removeClass("disabled");
        }

        if (
          oPaging.iPage === oPaging.iTotalPages - 1 ||
          oPaging.iTotalPages === 0
        ) {
          $("li:last", an[i]).addClass("disabled");
        } else {
          $("li:last", an[i]).removeClass("disabled");
        }
      }
    }
  }
});
