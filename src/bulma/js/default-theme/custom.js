
document.addEventListener('DOMContentLoaded', () => {
    //1. For delete close button
    (document.querySelectorAll('.notification .delete') || []).forEach(($delete) => {
        var $notification = $delete.parentNode;

        $delete.addEventListener('click', () => {
            $notification.parentNode.removeChild($notification);
        });
    });

    //2. for bulma navigation bar
    // Get all "navbar-burger" elements
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    // Check if there are any navbar burgers
    if ($navbarBurgers.length > 0) {
        // Add a click event on each of them
        $navbarBurgers.forEach(el => {
            el.addEventListener('click', () => {
                // Get the target from the "data-target" attribute
                const target = el.dataset.target;
                const $target = document.getElementById(target);
                // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
                el.classList.toggle('is-active');
                $target.classList.toggle('is-active');
            });
        });
    }

    //3. For bulma-fx
    // Trigger modals
    /*
    (function () {
        var modalFX = (function () {

            var elements = {
                target: 'data-target',
                active: 'is-active',
                button: '.modal-button',
                close: '.modal-close',
                buttonClose: '.modal-button-close',
                background: '.modal-background'
            };

            var onClickEach = function (selector, callback) {
                var arr = document.querySelectorAll(selector);
                arr.forEach(function (el) {
                    el.addEventListener('click', callback);
                })
            };

            var events = function () {
                onClickEach(elements.button, openModal);

                onClickEach(elements.close, closeModal);
                onClickEach(elements.buttonClose, closeAll);
                onClickEach(elements.background, closeModal);

                // Close all modals if ESC key is pressed
                document.addEventListener('keyup', function(key){
                    if(key.keyCode == 27) {
                        closeAll();
                    }
                });
            };

            var closeAll = function() {
                var openModal = document.querySelectorAll('.' + elements.active);
                openModal.forEach(function (modal) {
                    modal.classList.remove(elements.active);
                })
                unFreeze();            
            };

            var openModal = function () {
                var modal = this.getAttribute(elements.target);
                freeze();
                document.getElementById(modal).classList.add(elements.active);
            };

            var closeModal = function () {
                var modal = this.parentElement.id;
                document.getElementById(modal).classList.remove(elements.active);
                unFreeze();
            };

            // Freeze scrollbars
            var freeze = function () {
                document.getElementsByTagName('html')[0].style.overflow = "hidden"
                document.getElementsByTagName('body')[0].style.overflowY = "scroll";
            };
            
            var unFreeze = function () {
                document.getElementsByTagName('html')[0].style.overflow = ""
                document.getElementsByTagName('body')[0].style.overflowY = "";
            };

            return {
                init: function () {
                    events();
                }
            }
        })();

        modalFX.init();

    })();

*/

});

/*
document.addEventListener('DOMContentLoaded', () => {
    // Get all "navbar-burger" elements
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    // Check if there are any navbar burgers
    if ($navbarBurgers.length > 0) {
        // Add a click event on each of them
        $navbarBurgers.forEach(el => {
            el.addEventListener('click', () => {
                // Get the target from the "data-target" attribute
                const target = el.dataset.target;
                const $target = document.getElementById(target);
                // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
                el.classList.toggle('is-active');
                $target.classList.toggle('is-active');
            });
        });
    }
});
*/

/**Bulma-fx starts */

// Trigger modals
/*
(function () {
    var modalFX = (function () {

        var elements = {
            target: 'data-target',
            active: 'is-active',
            button: '.modal-button',
            close: '.modal-close',
            buttonClose: '.modal-button-close',
            background: '.modal-background'
        };

        var onClickEach = function (selector, callback) {
            var arr = document.querySelectorAll(selector);
            arr.forEach(function (el) {
                el.addEventListener('click', callback);
            })
        };

        var events = function () {
            onClickEach(elements.button, openModal);

            onClickEach(elements.close, closeModal);
            onClickEach(elements.buttonClose, closeAll);
            onClickEach(elements.background, closeModal);

            // Close all modals if ESC key is pressed
            document.addEventListener('keyup', function(key){
                if(key.keyCode == 27) {
                    closeAll();
                }
            });
        };

        var closeAll = function() {
            var openModal = document.querySelectorAll('.' + elements.active);
            openModal.forEach(function (modal) {
                modal.classList.remove(elements.active);
            })
            unFreeze();            
        };

        var openModal = function () {
            var modal = this.getAttribute(elements.target);
            freeze();
            document.getElementById(modal).classList.add(elements.active);
        };

        var closeModal = function () {
            var modal = this.parentElement.id;
            document.getElementById(modal).classList.remove(elements.active);
            unFreeze();
        };

        // Freeze scrollbars
        var freeze = function () {
            document.getElementsByTagName('html')[0].style.overflow = "hidden"
            document.getElementsByTagName('body')[0].style.overflowY = "scroll";
        };
        
        var unFreeze = function () {
            document.getElementsByTagName('html')[0].style.overflow = ""
            document.getElementsByTagName('body')[0].style.overflowY = "";
        };

        return {
            init: function () {
                events();
            }
        }
    })();

    modalFX.init();

})();
*/
/**Bulma-fx ends */