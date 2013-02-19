$(function(){
	$('form[name="userIsAdmin"] input[name="isAdmin"]').click(function(){
		$(this).parent('form').submit();
	});

	$('form[name="setTestResult"] select[name="testResult"]').change(function(){
		$(this).parent('form').submit();
	});

	$('form[name="appsettings"] .minus').click(function(){
		var numberInput = $(this).prevAll('input');
		var currentNumber = parseInt($(numberInput).val());

		if(currentNumber == NaN)
			return;
		if(currentNumber <= 0)
			return;
		else 
			currentNumber--; 

		$(numberInput).val(currentNumber);
	});


	$('form[name="appsettings"] .plus').click(function(){
		var numberInput = $(this).prevAll('input');
		var currentNumber = parseInt($(numberInput).val());

		if(currentNumber == NaN)
			return;
		else 
			currentNumber++; 

		$(numberInput).val(currentNumber);
	});
});