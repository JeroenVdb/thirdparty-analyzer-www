'use strict';

var showRequests = document.querySelectorAll('.fjs-show-requests'),
	i = 0;

for (i = 0; i < showRequests.length; i++) {
	showRequests[i].addEventListener('click', function(event) {
		event.preventDefault();

		if (this.nextSibling.className === '') {
			this.nextSibling.className = 'hidden';
		} else {
			this.nextSibling.className = '';
		}
	});
}
