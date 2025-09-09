$input = $("#my-input");
$input.datepicker();
$input.data('datepicker').hide = function () {};
$input.datepicker('show');