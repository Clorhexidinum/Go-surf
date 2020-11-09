$(function(){

  // $('.header__slider').slick({
  //   infinite: true,
  //   fade: true,
  //   cssEase: 'linear',
  //   prevArrow: '<img class="slider-arrows slider-arrows__left" src="images/arrows-left.svg" alt="">',
  //   nextArrow: '<img class="slider-arrows slider-arrows__right" src="images/arrows-right.svg" alt="">',
  //   asNavFor: '.slider-dots',
  // });

  // $('.slider-dots').slick({
  //   slidesToShow: 4,
  //   slidesToScroll: 1,
  //   asNavFor: '.header__slider',
  // });

  // $('.surf-slider').slick({
  //   slidesToShow: 4,
  //   slidesToScroll: 1,
  //   prevArrow: '<img class="slider-arrows slider-arrows__left" src="images/arrows-left.svg" alt="">',
  //   nextArrow: '<img class="slider-arrows slider-arrows__right" src="images/arrows-right.svg" alt="">',
  //  asNavFor: '.slider-map',
  // });

  $('.slider-map').slick({
    slidesToShow: 8,
    slidesToScroll: 1,
    arrows: false,
    asNavFor: '.surf-slider',
    focusOnSelect: true
  });

  $('.travel__slider').slick({
    infinite: true,
    fade: true,
    cssEase: 'linear',
    prevArrow: '<img class="slider-arrows slider-arrows__left" src="images/arrows-left.svg" alt="">',
    nextArrow: '<img class="slider-arrows slider-arrows__right" src="images/arrows-right.svg" alt="">',
  });

});

