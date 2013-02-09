$(function(){
	$('form[name="userIsAdmin"] input[name="isAdmin"]').click(function(){
		$(this).parent('form').submit();
	});

	$('form[name="setTestResult"] select[name="testResult"]').change(function(){
		$(this).parent('form').submit();
	});
});