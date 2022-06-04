function toggleMenu() {
  window.menuVisible = !menuVisible;

  if (!menuVisible) {
    $("#menu").addClass("hidden");
    $("#menu-hide-button line").attr({
      x2: 50,
      y2: 50,
    });
  } else {
    $("#menu").removeClass("hidden");
    $("#menu-hide-button #line1").attr({
      x2: 90,
      y2: 10,
    });
    $("#menu-hide-button #line2").attr({
      x2: 90,
      y2: 90,
    });
  }
}
