jQuery(document).ready(function($) {
  var $window = $(window);
  var prev = 0;

  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  var window_width = $window.innerWidth(),
      window_height = $window.innerHeight(),
      hero_height = $('.hero ._row').innerHeight(),
      $nav = $('.nav');

  // ---------------- scroll to hide nav, pull to show
  $window.on('scroll', function(){
    if ($window.innerWidth() <= 980) {
      return false;
    } else {
      var scrollTop = $window.scrollTop();

      if (scrollTop < $window.innerHeight()) {
        $('.nav.desktop_tablet-m')
          .css("background", "none")
          .addClass('top');
          // .css("top", "16px");
        $('.nav.desktop_tablet-m .logo').css("opacity", "0");
      }

      else {
        $('.nav.desktop_tablet-m')
          .css("background", "rgba(32,36,69,0.9)")
          .removeClass('top');
          // .css("top", "0");
        $('.nav.desktop_tablet-m .logo').css("opacity", "1");
      }

      $nav.toggleClass('slideout', scrollTop > prev);
      prev = scrollTop;
    }
  });


  // ---------------- mobile nav toggle
  $('.nav__toggle').click(function(){
    $(this).toggleClass('collapsed');
    $('html, body').toggleClass('noscroll');
    $('.hero').css('pointer-events', 'none');
  });

  $('nav.mobile-m a').click(function() {
    $('#navigation').prop('checked', false);
    $('.nav__toggle').toggleClass('collapsed');
    $('html, body').removeClass('noscroll');
    $('.hero').css('pointer-events', 'initial');
  });

  $('#main').click(function() {
    var $nav_mobile = $('#navigation');
    var isChecked = $nav_mobile.prop('checked');

    if (isChecked) {
      $nav_mobile.prop('checked', false)
      $('.nav__toggle').addClass('collapsed');
      $('html, body').removeClass('noscroll');
      $('.hero').css('pointer-events', 'initial');
    }
  });


  // ---------------- parallax
  $window.stellar();


  // ---------------- fullscreen
  $window.on('load resize', function() {
    $('.fullscreen').each(function() {
      fullscreen($(this));
    });

    if ($window.innerWidth() <= 768) {
      $('.footer__social .icon').addClass('icon--m');
    } else {
      $('.footer__social .icon').removeClass('icon--m');
    }
  });

  function fullscreen(hero) {
    var window_height = $window.innerHeight();
    var hero_height = $('.hero ._row').innerHeight();

    hero.height('auto');

    if (window_height > hero_height) {
      hero.height(window_height);
    }
  }


  // ---------------- smooth scroll to anchor
  $('a[href*="#"]').not('[href="#"]').not('[href="#0"]').click(function(event) {
    if (
      location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {

      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');

      if (target.length) {
        event.preventDefault();
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 600, function() {

          var $target = $(target);
          $target.focus();

          if ($target.is(":focus")) {
            return false;
          } else {
            $target.attr('tabindex','-1');
            $target.focus();
          };
        });
      }
    }
  });


	// ---------------- call responsive image when class .hires is added
  //if (window.devicePixelRatio == 2) {
  //  var images = $(".hires");

    // loop through the images and make them hi-res
  //  for(var i = 0; i < images.length; i++) {
  //    var image = images[i];

      // create new image name
  //    var imageType = image.src.substr(-4);
  //    var imageName = image.src.substr(0, image.src.length - 4);
  //    imageName += "@2x" + imageType;

      //rename image
  //    image.src = imageName;
  //  }
  //}


  // ---------------- DATA Technology Layer Image Hover
  $('a.to_highlight').hover(
    function() {
      var newHref = $(this).attr("id");
  		$('.datalayer_' + newHref)
        .addClass('is_hover')
        .siblings().css('opacity','0.4');
  	},
    function() {
      var newHref = $(this).attr("id");
  		$('.datalayer_' + newHref)
        .removeClass('is_hover')
        .siblings().css('opacity','1');
  	}
  ).on('click', function() {
    return false;
  });


  // ---------------- Modal Pop Up
  $('a.fire-modal-window').on('click', function(e){
    e.preventDefault();
    var $this = $(this);
    var isActive = $this.hasClass("active");

    $('.modal-window.active, .fire-modal-window.active').removeClass('active');

    if (!isActive) {
      var target = $this.data('modal-target');

      $this.addClass('active');
      $('.modal-window').filter('.' + target).addClass('active')
    }
    return false;
  });

  $('#main').click(function() {
    $('.modal-window, .fire-modal-window').removeClass('active');
  });

  $(document).keyup(function(e) {
    if (e.keyCode === 27) {
      $('.modal-window, .fire-modal-window').removeClass('active');
    }
  });

  $('.modal-window__content').click(function(e) {
    event.stopPropagation();
  });


  // ---------------- newsletter form submission
  $('.newsletter-form').on("submit", function (e) {
    e.preventDefault();

    var $emailField = $(this).find("input.email");
    var value = $emailField.val();

    sendEmail(value);
  });

  function sendEmail(e) {
    $.ajax({
      url: 'tail/emails',
      data: JSON.stringify(e),
      type: 'POST',             //GET
      async: true,              //或false,是否异步
      ContentType: "application/json",
      headers: {
        "Content-Type": "application/json"
      },
      data: JSON.stringify({"email": e}),
      timeout: 5000,            //超时时间
      dataType: 'json',         //返回的数据格式：json/xml/html/script/jsonp/text
      success: function (data, textStatus, jqXHR) {
        if (data.code == "001") {
          $('.successTip').show();
          setTimeout(function () {
            $('.successTip').hide();
          }, 3000)
        }
        if (data.code == "000") {
          $('.errorTip').show();
          setTimeout(function () {
            $('.errorTip').hide();
          }, 3000)
        }
      },
      error: function (xhr, textStatus) {
        // console.log('错误')
        // console.log(xhr)
        // console.log(textStatus)
      },
      complete: function () {
        // console.log('结束')
      }
    });
  }

});
