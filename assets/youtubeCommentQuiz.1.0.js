/* --------------------------------------------- globals ---------------------------------------- */

var URLIdentifier = 'youtubecommentquiz.phpfogapp.com'; // Needed for sharing functions and google analytics. E.g. 'example.com'.
var soundcloudAPIKey = "49ede2994ee83a3410b36d842a98b5bb";
var youtubeAPIKey = "AI39si4DeTiR_GEVmIcpGmSlKl0QksJjyyj2tD1usm8eYJ44NqqevbP5o9Vh01xRK2uaoMEHRjTdBbhQtthUnnXknIaySJ_vGg"; // youtube API key.
var numberOfQuestions = 7; // Nomen est omen.
var reloads = 3; // int: The global reload integer, indicates how many reloads are available during the game.
var assetPath = 'http://youtubecommentquiz.phpfogapp.com/'; // URL to where the 'assets' directory is stored.
var googleAnalyticsAccount = 'UA-3691657-11';

var debug = false; // Console messages while development.

var proxyURL  = 'assets/json-proxy.php?url='; // Global proxy URL for JSON call.

var category=''; // Category of videos to display ('mixed' by default).

var sound = true; // Boolean: sound on or off.
var allowInteract = false; // boolean: Decides if it is possible to interact (due to problems when the players have not been completey loaded).
var winnerVideo; // Number of the winner video;
var carouselDuration = 200; // Base for dependant animations.
var rightAnswers = 0; // Indicator for how many question have been answered correctly.
var wrongAnswers = 0; // Indicator for how many question have been answered damn WRONG.
var correctAnswer; // Boolean: Indicates if a answer was right during the game.
var currentStage;

// See categories in index.htm as DOM Template.

// Image preloader: Index-Array for images to be loaded when dom ready before game starts.
// src comes with set assetPath variable.
var images = [
    'buzzerBackgroundSprite.jpg',
    'loaderGrey.png',
    'miniComment.png',
    'miniReloadButton.png',
    'miniVideoButton1.png',
    'miniVideoButton2.png',
    'miniVideoButton3.png',
    'nextButtonSprite.png',
    'reloadButton.png',
    'shareButtons.png',
    'stageBackgroundImage.jpg',
    'categoryDropdownBG.png'
    ];

// See sounds further below.

// String storage for correct answers.
var winnerArray = [];
winnerArray[0] = "That is right.";
winnerArray[1] = "Yes.";
winnerArray[2] = "Damn right.";

// String storage for wrong answers.
var loserArray = [];
loserArray[0] = "Wrong.";
loserArray[1] = "Too bad.";
loserArray[2] = "Almost right, but wrong.";

// String storage for winner result statements.
var resultWinnerArray = [];
resultWinnerArray[0] = "You are a killer!";
resultWinnerArray[1] = "Strike.";
resultWinnerArray[2] = "You got it!";

// String storage for loser result statements.
var resultLoserArray = [];
resultLoserArray[0] = "Next time better.";
resultLoserArray[1] = "Next time better.";
resultLoserArray[2] = "Next time better.";

/* --------------------------------------------- /globals --------------------------------------- */
/* ---------------------------------------- helper functions ------------------------------------ */

// Function for console.log if debug is true.
function consoleMessage ( message )
{
    if ( debug )
    {
        console.log( message );
    }
}

// Get a random number.
function randomFromTo(from, to){
    return Math.floor(Math.random() * (to - from + 1) + from);
}

// Let the loader rotate endlessly.
function rotateLoader(loader){
       var angle = 0;
       window.setInterval(function(){
              angle+=10;
              loader.rotate(angle);
       },25);       
}

// Let the reload Button rotate one time.
function rotateReloadButton(){       
        $('#reload img').rotate({
              angle:0,
              animateTo:360,
              duration: 1000
        });
}

// Function to apply a background-image (CSS) to an element.
// Needed because DOM is build by JavaScript and due to flexible assets path (published on tumblr.com).
function applyBackgroundImage(targetElement,imageName){
    $(targetElement).css('background-image','url(' + assetPath + 'assets/images/' + imageName + ')')
}

// Function to load an image into an element.
// Deletes existing child elements.
function insertImage(targetElement,imageName){    
    $(targetElement).html('<img>');
    $(targetElement).children().attr('src',assetPath + 'assets/images/' + imageName);    
}

function denyInteracting(){
    $('#next').addClass('hidden');
    $('#reload').addClass('hidden');
    $('li .quizStageBottomTop div').addClass('hidden');
    allowInteract = false;    
}
function allowInteracting(){
    $('#next').removeClass('hidden');
    $('#reload').removeClass('hidden');
    $('li .quizStageBottomTop div').removeClass('hidden');
    allowInteract = true;
}

// Fits the (wrapping) elements of the carousel due to full screen functionality.
function resizeCarouselHeight() { 
    var winHeight = $(window).height();   
    $('.jcarousel-skin-tango .jcarousel-clip-horizontal').css('height',winHeight);
    $('.jcarousel-skin-tango .jcarousel-item-horizontal').css('height',winHeight);
    $('#stages').css('height',winHeight);    
};

// Fit stage elements: Resize height of middle element.
function fitStageElements(){
    var winHeight = $(document).height();  
    consoleMessage('winHeight: ' + winHeight);
    // Needed variables.
    var topElement = '';
    var topElementHeight = '';
    var middleElement = '';
    var middleElementHeight = '';
    var bottomElement = '';
    var bottomElementHeight = '';
    var middleElementChild = '';
    var middleElementPadding = '';
    var unusedSpace = '';    
    // If 'stageTemplate' exists.
    if($('#youtubeCommentQuiz .stage').length){
        topElement = $('.stageTop');
        middleElement = $('.stageMiddle');
        middleElementChild = $('.stageMiddle:first');
        bottomElement = $('.stageBottom');      
    }    
    // If 'quizStageTemplate' exists.
    if($('#youtubeCommentQuiz .quizStage').length){
        topElement = $('.quizStageTop');
        middleElement = $('.quizStageMiddle');
        middleElementChild = $('.quizStageMiddle:first');
        bottomElement = $('.quizStageBottom');
    }
    // Set the variables.
    topElementHeight = topElement.outerHeight(true);
    middleElementHeight = middleElement.outerHeight(true);
    bottomElementHeight = bottomElement.outerHeight(true);    
    // Height of first child element of middleElement.
    middleElementChildHeight = middleElementChild.height();
    consoleMessage('middleElementChildHeight: ' + middleElementChildHeight);
    // How much space is not used?
    unusedSpace = winHeight-topElementHeight-bottomElementHeight-middleElementChildHeight;
    consoleMessage('unusedSpace: ' + unusedSpace);    
    // Set needed padding.
    if(unusedSpace<50){
        middleElementPadding = 25; // Min padding.
    }else{
        middleElementPadding = Math.floor(unusedSpace/2);
        consoleMessage('middleElementPadding: ' + middleElementPadding);
    }    
    // Apply padding.
    middleElement.animate({
        paddingTop:middleElementPadding,
        paddingBottom:middleElementPadding
    },carouselDuration/2);
}

// Let the reload button slightly disappear.
function fadeOutElement(targetElement,duration){
    duration = duration || 1000;
    $(targetElement).animate({
       opacity: 0.2, 
    }, duration
    );
    $(targetElement).remove();
}

// Get a random video and display it incl. the comment, since it is the winner video.
function displayVideosAndComment(i,isWinner){    
    // Deny reloading while intializing the player (due to player problem bullshit depending on that).
    denyInteracting();
    consoleMessage("getRandomVideo()");
    var divID;
    var videoID='';
    var startIndex = randomFromTo(1,50)
    // Build API Request URL.
    var videoJSONURL = '';    
    videoJSONURL += 'http://gdata.youtube.com/feeds/api/standardfeeds/top_rated' // Base string, see http://code.google.com/intl/de-DE/apis/youtube/2.0/developers_guide_protocol.html#Category_specific_standard_feeds.
    if(category){ // If 'category is set'.
    videoJSONURL += '_' + category;                 // Add category.
    }
    videoJSONURL += '?start-index=' + startIndex;   // Add start-index.
    videoJSONURL += '&max-results=1&v=2&alt=json';  // Add Version2, JSON-Format and max-results.
    videoJSONURL += '&key=' + youtubeAPIKey;        // Add API-Key.
    
    
    consoleMessage("   videoJSONURL: " + proxyURL + escape( videoJSONURL ) );
    $.getJSON( proxyURL + escape( videoJSONURL ),
        function(json){
            if(json.feed.entry!=undefined){                
                consoleMessage("   videoID: " + json.feed.entry[0].media$group.yt$videoid.$t);
                videoID = json.feed.entry[0].media$group.yt$videoid.$t;    
            }else{
                consoleMessage('NO VIDEO ID RECEIVED, TRY AGAIN.');
                displayVideosAndComment(i,isWinner);
            }                
        })
        .success(function() {
            if(videoID!=''){
                divID = "#video" + i;
                // Clear video div.
                $(divID).html('');
                // Display the video.            
                jQuery(divID).tubeplayer({
                        width: 280, // the width of the player
                        height: 190, // the height of the player
                        allowFullScreen: "false", // true by default, allow user to go full screen
                        initialVideo: videoID, // the video that is loaded into the player
                        preferredQuality: "small",// preferred quality: default, small, medium, large, hd720
                        autoPlay: true,
                        iframed: false // iframed can be: true, false; if true, but not supported, degrades to flash
                });
                jQuery(divID).tubeplayer("volume", 20);
                // Is this the winner video?
                if(isWinner){
                    // Display the comment.
                    displayComment(videoID)
                }
            }
        });        
};

// Displays a comment from a given videoID in the comment div.
function displayComment(videoID){        
    var comment;
    var commentJSONURL = '';
    commentJSONURL += "https://gdata.youtube.com/feeds/api/videos/" + videoID + "/comments?v=2&start-index=" + randomFromTo(1,30) + "&max-results=1&alt=json&key=" + youtubeAPIKey;
    consoleMessage("      commentJSONURL " + proxyURL + escape( commentJSONURL ) );    
    $.getJSON( proxyURL + escape( commentJSONURL ),
        function(json){           
            consoleMessage("      Comment: " + json.feed.entry[0].content.$t);
            comment = json.feed.entry[0].content.$t;            
        })
        // Error: No data received.
        .error(function(){
            consoleMessage('Error receiving comment data.');
            // Try it again.
            displayComment(videoID);
        })
        // Success: Got comment data.
        .success(function() {
            // Some constraints for the comment.
            if(comment.substring(0,1) == '@' || comment==null || comment=='' || !comment || comment.length>70){
                consoleMessage('No good comment.');
                // Try it again.
                displayComment(videoID);
            }else{
                $('#comment').text(comment);
                fitStageElements(); // Fit the coming elements, once again when comment div is filled.                
            }
        }); 
}

// Update indicator bars.
function updateIndicatorBars(correctAnswer){
    var widthBase = 60;               
    // Make bars visible.
    $('.resultIndicatorBottom').animate({opacity:1,height:60,marginBottom:20});
    if(rightAnswers>0){ $('.resultIndicatorTop').animate({opacity:1,height:60,marginBottom:20}); }
    if(wrongAnswers>0){ $('.resultIndicatorMiddle').animate({opacity:1,height:60,marginBottom:20}); }
    
    // Remove left questions indicator.
    if((numberOfQuestions-rightAnswers-wrongAnswers)==0){
         $('.resultIndicatorBottom').animate({opacity:0,height:1,marginBottom:0});
    }   
    
    // Set width of bars.
    $('.resultIndicatorBottom').animate({width:widthBase*(numberOfQuestions-rightAnswers-wrongAnswers)});
    $('.resultIndicatorTop').animate({width:widthBase*rightAnswers});
    $('.resultIndicatorMiddle').animate({width:widthBase*wrongAnswers});
    
    // Set numbers to indicator bars.
    $('.resultIndicatorBottom').text(numberOfQuestions-(rightAnswers+wrongAnswers));  // Left number of questions.
    $('.resultIndicatorTop').text(rightAnswers);
    $('.resultIndicatorMiddle').text(wrongAnswers); 
    
    // Make sound.
    if(correctAnswer){
        if(sound){soundWin.play()};
    }else{
        if(sound){soundLoose.play()};
    }
}

// Preload Images.
var loadedImages = 0;
function preloadImages(){    
    var a = 0;
    tempImageObject = [];
    while(a < images.length){
        // Create new image object and append img to the hidden container.
        tempImageObject[a] = new Image();
        tempImageObject[a].src = assetPath + 'assets/images/' + images[a]; // Global array with image names.
        $('.preloadedImageContainer').append('<img src="' + tempImageObject[a].src + '" />');
        // Add listener to check when loaded, then count it.
        $(tempImageObject[a]).live('load',function(a){
            loadedImages++;
        });
        a++;
    }    
    consoleMessage('loadedImages: ' + loadedImages);    
}

// Define sounds.
var soundTheme = '';
var soundSword = '';
var soundWin = '';
var soundLoose = '';

// Preload Sounds.
var loadedSounds = 0;
function preloadSounds(){           
    // 4 Sounds.  
    soundTheme = SC.stream(35895898); // Theme music at the beginning and end.
    soundTheme.load();
    soundSword = SC.stream(34588862); // Sword, played when next/start button is clicked.
    soundSword.load();
    soundSword.setVolume(30);
    soundWin = SC.stream(34597588); // Win sound on temp result stage.
    soundWin.load();
    soundWin.setVolume(40);
    soundLoose = SC.stream(34597605); // Loose sound on temp result stage.
    soundLoose.load();  
    soundLoose.setVolume(40);
}
    
// Play theme.
function playTheme(){
    soundTheme.play({
        // Play it endlessly.
        onfinish:function(){
            playTheme();
        }
    });
    // If no sound, mute it.
    if(!sound){
        soundTheme.setVolume(0);
    }        
}
  
// Function to determine the loading state in different ways (based on an interval), see variable 'check'.
var loadedRessources = 0; // Sum of all media items to loads (images are seen as one).
loadedImagesListener = true;
soundThemeListener = true;
soundSwordListener = true;
soundWinListener = true;
soundLooseListener = true;
function loadingState(){
    consoleMessage('Check loading state.');
    if(loadedImages==images.length && loadedImagesListener!=false){
        consoleMessage('All images loaded.');
        loadedRessources++;
        loadedImagesListener=false;
    }
    // For sound readyState see http://www.schillmania.com/projects/soundmanager2/doc/#readystate.
    if(soundTheme.readyState==1 && soundThemeListener!=false){ // 1=loading.
        consoleMessage('soundTheme is loading.');
        loadedRessources++;
        soundThemeListener=false
    }
    if(soundSword.readyState==3 && soundSwordListener!=false){ // 3=loaded.
        consoleMessage('soundSword loaded.');
        loadedRessources++;
        soundSwordListener=false;
    }
    if(soundWin.readyState==3 && soundWinListener!=false){
        consoleMessage('soundWin loaded.');
        loadedRessources++;
        soundWinListener=false;
    }
    if(soundLoose.readyState==3 && soundLooseListener!=false){
        consoleMessage('soundLoose loaded.');
        loadedRessources++;
        soundLooseListener=false;
    }
    // All items are loaded (4 Sounds + images as one).
    if(loadedRessources>4){
        window.clearInterval(check); // Clear interval.
        // Flip to next stage.
        quizCarousel.next();
        // Create welcome stage.
        window.setTimeout('createWelcomeStage()',carouselDuration/4);
        // Destroy loading stage.
        destroyLoadingStage();
    }    
}
// Check the loaded item in an interval, cleared by function loadedRessources().
var check = window.setInterval('loadingState()', 1000);

/* ---------------------------------------- /helper functions ------------------------------------ */
/* ---------------------------------------- carousel control ------------------------------------- */
// (Basic) control functions, based on the carousel.
// See http://sorgalla.com/projects/jcarousel/examples/static_controls.html.
var quizCarousel; // Global object for the carousel.
function controlFunctions(carousel){ 
    quizCarousel = carousel; // Set this object.
    /* ------------------ THE START OR NEXT BUTTON IS CLICKED. ------------------ */    
    // Get next stage.    
    $('#youtubeCommentQuiz .nextStage').live('click',function(){       
        currentStage = $(this).parents("li.jcarousel-item");
        targetStage = currentStage.next("li.jcarousel-item");
        
        // If there are still unanswered questions, the game has to go on.
        if((rightAnswers+wrongAnswers)<numberOfQuestions){
            createQuizStage(targetStage);
            window.setTimeout('destroyTempResultStage(currentStage)',carouselDuration);
            window.setTimeout('fitStageElements()',carouselDuration);
            winnerVideo = reloadQuizStage(); // Fills the template and stores the number of the winner video.
        // If this was the last question.
        }else{
            consoleMessage('Here comes the final result.');
            window.setTimeout('destroyTempResultStage(currentStage)',carouselDuration);
            window.setTimeout('fitStageElements()',carouselDuration);
            createResultStage(targetStage);
        }
        if(sound){soundSword.play()}; // Play sword sound.
        // Flip to next stage.
        carousel.next();        
        // In case this is the first question after welcome Stage.
        if((rightAnswers+wrongAnswers)==0){
            // Stop theme sound.
            window.setTimeout('soundTheme.stop()',carouselDuration);
            // Kill welcomeStage.
            window.setTimeout('destroyWelcomeStage()',carouselDuration);
        }
        
    });
    /* ------------------ /THE START OR NEXT BUTTON IS CLICKED. ------------------ */    
    // ---------------------- ONE OF THE BUZZERS IS CLICKED. --------------------- */
    // Get next (temp) result stage.
    // Listener has to live the whole time.
    $('#youtubeCommentQuiz .quizStageBottomTop div').live('mouseup',function(){
        if(allowInteract){                    
            if(sound){soundSword.play()}; // Play sword sound.
            consoleMessage('BUZZER CLICK');          
            currentStage = $(this).parents("li.jcarousel-item");
            targetStage = currentStage.next("li.jcarousel-item"); 
            
            // Evaluate if right or wrong answer.            
            var clickedBuzzer = $(this).attr('id').substring(6,7); // Get number of clicked buzzer.
            
            if(clickedBuzzer==winnerVideo){
                // Right answer.
                consoleMessage('Right answer.');
                rightAnswers++;
                createTempResultStage(targetStage,true);  
            }else{
                // Wrong answer.
                consoleMessage('Wrong answer.');
                wrongAnswers++;
                createTempResultStage(targetStage,false);  
            }
            carousel.next(); // Flip to next stage.
            window.setTimeout('destroyQuizStage()',carouselDuration);
            window.setTimeout('fitStageElements()',carouselDuration);
        }         
     });   
    // ---------------------- /ONE OF THE BUZZERS IS CLICKED. --------------------- */     
}
/* ------------------------------------------ /carousel control -------------------------------------- */
/* --------------------------------------------- loadingStage ---------------------------------------- */

// Create loading stage.
function createLoadingStage(){
    consoleMessage('Create loading stage.');
    
    // Apply stage DOM to first li.
    $('#youtubeCommentQuiz li:first-child').append($('#stageTemplate').html());
    
    // Add class loadingStage.
    $('#youtubeCommentQuiz .stage').addClass('loadingStage');
    
    // Remove unneeded DOM.
    $('#youtubeCommentQuiz .stageBottomTop').remove();
    
    // Add fixed loading indicators container.
    $('#youtubeCommentQuiz .stageMiddle').append('<div class="loadingIndicatorsContainer"></div>');
    $('#youtubeCommentQuiz .loadingIndicatorsContainer').css({
        height:'90px'
    });
    
    // Insert loading image.
    insertImage($('#youtubeCommentQuiz .loadingIndicatorsContainer'),'loaderWhite.png');
    // Let the loader roll.
    rotateLoader($('#youtubeCommentQuiz .loadingIndicatorsContainer img'));
    
    // Append loading string container + string.
    $('#youtubeCommentQuiz .loadingIndicatorsContainer').append('<div id="loadingIndicatorString"></div>');
    $('#loadingIndicatorString').text('Loading');  
    
    // Add preload image container to body.
    $('body').append('<div class="preloadedImageContainer displayNone"></div>');    
    
    // Preload ressources.
    preloadImages();
    preloadSounds();    
}

// Destroy Loading stage.
function destroyLoadingStage(){    
    // Kill the listeners!
    $('.preloadedImageContainer img').die();
    // Kill the DOM.
    $('#youtubeCommentQuiz .loadingStage').remove();
    consoleMessage('Loading stage killed.');
}
/* -------------------------------------------- /loadingStage ---------------------------------------- */
/* --------------------------------------------- welcomeStage ---------------------------------------- */
// Create welcome stage.
function createWelcomeStage(targetStage){        
    // Apply the base template.
    $('#youtubeCommentQuiz li:nth-child(2)').append($('#stageTemplate').html());
    
    // Apply BG images to stage.
    applyBackgroundImage('#youtubeCommentQuiz .stageTop','stageBackgroundImage.jpg');
    applyBackgroundImage('#youtubeCommentQuiz .stageMiddle','stageBackgroundImage.jpg');

    // Play theme.   
    window.setTimeout('playTheme()',carouselDuration); 
    
    // Add title.
    $('#youtubeCommentQuiz .stageTop').html('youtubeCommentQuiz');
    
    // Add category list dropdown, see http://www.queness.com/resources/html/dropdownmenu/index.html.
    $('#youtubeCommentQuiz .stageMiddle').html($('#categoryDropdownTemplate').html());
    
    // Add BG image to dropdown.
    applyBackgroundImage('#youtubeCommentQuiz #categoryDropdown #choose','categoryDropdownBG.png');
    
    // Add rounded corners to last dropdown element.
    $('#youtubeCommentQuiz #categoryDropdown li li:last span').addClass('last');
    
    // Add listeners to categoryDropdown.
    $('#youtubeCommentQuiz #categoryDropdown li')
        .live('click',function(){
            $('ul',this).slideToggle(carouselDuration/2); // Toggle dropdown.
        });     
    $('#youtubeCommentQuiz #categoryDropdown span')
        .live('click',function(){
            // If an element is clicked (not the first one), set this text to first element.
            if($(this).text() != $('#youtubeCommentQuiz #categoryDropdown #choose').text()){
                $('#youtubeCommentQuiz #categoryDropdown #choose').text($(this).text());
                $('#youtubeCommentQuiz #categoryDropdown #choose').addClass('active');
                $('#youtubeCommentQuiz #categoryDropdown').css('margin-bottom','80px');
                category = $(this).parent().attr('id');
                consoleMessage('category: ' + category);
                allowInteracting();
                fitStageElements();
            }
            // Add or remove class 'opened' (for rounded corners of first element).
            if($('#youtubeCommentQuiz #categoryDropdown #choose').hasClass('opened')){
               $('#youtubeCommentQuiz #categoryDropdown #choose').removeClass('opened');
            }else{
               $('#youtubeCommentQuiz #categoryDropdown #choose').addClass('opened');
            }
        });
    
    // Create start button.
    $('#youtubeCommentQuiz .stageMiddle').append('<div></div>');
    $('#youtubeCommentQuiz .stageMiddle div').attr('id','next').text('Start');
    applyBackgroundImage('#next','nextButtonSprite.png');
    
    // Deny interacting.
    denyInteracting();
    
    // Add '.nextStage' to start button.
    $('#youtubeCommentQuiz .stageMiddle #next').addClass('nextStage');
    
    // Add listeners to start button.    
    $('#youtubeCommentQuiz #next')
              .live('mouseover',function(){
                    $(this).addClass('hover');
                })
              .live('mouseout',function(){$(this).removeClass('hover');})
              .live('mousedown',function(){
                    $(this).removeClass('hover');
                    $(this).addClass('click');
              })
              .live('mouseup',function(){
                     $(this).removeClass('click');
                     $(this).addClass('hover');
              ;})
              .live('mouseout',function(){$(this).removeClass('click');});
              
    // Kill unneeded DOM.
    $('#youtubeCommentQuiz .stageBottomTop').remove();
              
    // Add standard links.
    $('#youtubeCommentQuiz .stageBottomBottom')
            .append('<span id="help">Help</span>')
            .append('<span id="credits">Credits</span>')
            .append('<span id="sounds">Sounds off</span>'); 
              
    // If sound is off per default.
    if(!sound){
        $('#sounds').addClass('line-through');
    }
              
    // Add listeners to standard links.
    $('#help').live('click',function(){
        $.colorbox({
            html:$('#helpContent').html(),
            opacity:0.7,
            close:null,
            width:720
        });    
    });   
    $('#credits').live('click',function(){
        $.colorbox({
            html:$('#creditsContent').html(),
            opacity:0.7,
            close:null,
            width:720,
            height:500
        });    
    });    
    $('#sounds').live('click',function(){
        if(sound){
            $('#youtubeCommentQuiz .stageBottomBottom #sounds').text('Sounds on');
            soundTheme.setVolume(0);
            sound=false;
        }else{
            $('#youtubeCommentQuiz .stageBottomBottom #sounds').text('Sounds off');
            soundTheme.setVolume(100);
            sound=true;
        };
    });
    
    // Fit stage elements.
    fitStageElements();              
}
// Destroy welcome stage.
function destroyWelcomeStage(){    
    // Kill dropdown listeners.
    $('#youtubeCommentQuiz #categoryDropdown li').die();
    $('#youtubeCommentQuiz #categoryDropdown span').die();    
    // Kill the event handler from the start button.
    $('#youtubeCommentQuiz #next').die();    
    // Remove '.nextStage' from #next.
    $('#youtubeCommentQuiz #next').removeClass('nextStage');        
    // Remove DOM completely.
    $('#youtubeCommentQuiz .stage').remove();    
    // Kill standard links listeners.
    $('#youtubeCommentQuiz .stageBottomBottom').die();    
    consoleMessage('welcomeStage killed.');
}
/* -------------------------------------------- /welcomeStage ---------------------------------------- */
/* --------------------------------------------- quizStage ------------------------------------------- */
// Create quiz stage
function createQuizStage(targetStage){
       // Delete old data before filling.
       targetStage.html('');
       // Fill the stage with template markup.
       targetStage.append($('#quizStageTemplate').html());
       
       // Apply BG images.
       applyBackgroundImage('#youtubeCommentQuiz .quizStageTop','stageBackgroundImage.jpg');
       applyBackgroundImage('#youtubeCommentQuiz .quizStageMiddle','stageBackgroundImage.jpg');
       applyBackgroundImage('#youtubeCommentQuiz .quizStageBottomTop','stageBackgroundImage.jpg'); 
       applyBackgroundImage('#youtubeCommentQuiz .quizStageBottomTop div','buzzerBackgroundSprite.jpg');       

       // Add the event handler to the buzzer buttons.
       $('#youtubeCommentQuiz .quizStageBottomTop div')
              .live('mouseover',function(){
                    if(allowInteract){
                        $(this).addClass('hover');
                    }
                })
              .live('mouseout',function(){$(this).removeClass('hover');})
              .live('mousedown',function(){
                    if(allowInteract){
                        $(this).removeClass('hover');
                        $(this).addClass('click');
                    }
              })              
              .live('mouseup',function(){
                     $(this).removeClass('click');
                     $(this).addClass('hover');
              ;})
              .live('mouseout',function(){$(this).removeClass('click');});

       // Add the event handler to the reload button.
       $('#youtubeCommentQuiz .quizStageBottomBottom #reload')
              .live('mouseover',function(){
                    if(allowInteract){
                        $(this).addClass('hover');
                    };                
                })
              .live('mouseout',function(){$(this).removeClass('hover');})
              .live('mousedown',function(){
                    if(allowInteract){
                        if(sound){soundSword.play()};
                        reloads--;                    
                        winnerVideo = reloadQuizStage(true);
                    };
              });            
}

// Destroy quiz stage: Kills DOM, objects and listeners.
function destroyQuizStage(){    
    // Kill tubeplayers.
    $('#youtubeCommentQuiz #video1').tubeplayer("destroy");
    $('#youtubeCommentQuiz #video2').tubeplayer("destroy");
    $('#youtubeCommentQuiz #video3').tubeplayer("destroy");    
    // Remove DOM completely.
    $('#youtubeCommentQuiz .quizStage').remove();
    // Kill the event handler from the buzzer buttons.
    // $('#youtubeCommentQuiz .quizStageBottomTop div').die();
    // Kill the event handlers from the reload button.
    $('#youtubeCommentQuiz .quizStageBottomBottom #reload').die();
    consoleMessage('quizStage killed.');
}

// Function to reload the videos und comment on the quiz stage (also intially used).
function reloadQuizStage(viaReloadButton){
    
    viaReloadButton = viaReloadButton || false;
    
    // Number of loaded tubeplayers.
    var loadedTubeplayers = 0;
    
    if(!viaReloadButton){
        // First of all: kill old bottom elements.
        $('#youtubeCommentQuiz .quizStageBottomBottom div').remove();
    }
    
    consoleMessage('Available reloads: ' + reloads);
    
    // Kill existing tubeplayers.
    $('#youtubeCommentQuiz #video1').tubeplayer("destroy");
    $('#youtubeCommentQuiz #video2').tubeplayer("destroy");
    $('#youtubeCommentQuiz #video3').tubeplayer("destroy");
    
    //Clear video divs.
    $('#youtubeCommentQuiz .quizStageTop div').html('');
    
    // Insert the loaders.
    insertImage('#youtubeCommentQuiz .quizStageTop div','loaderWhite.png');
    insertImage('#youtubeCommentQuiz #comment','loaderGrey.png');    
    
    // Let the loaders roll.
    rotateLoader($('#youtubeCommentQuiz .quizStageTop div img'));
    rotateLoader($('#youtubeCommentQuiz #comment img'));     
        
    // Nomen est omen.
    rotateReloadButton();          
    
    // If there are still reloads available.
    if(reloads>0){        
        // If the quiz stage is filled while creating a new one, not just reload.
        if(!viaReloadButton){
            // Kill old DOM.
            // $('#reload').remove();
            // Create the reload button element incl. indicator span.
            $('#youtubeCommentQuiz li .quizStageBottomBottom').prepend('<div>');
            $('#youtubeCommentQuiz li .quizStageBottomBottom div:first-child').attr('id', 'reload');
            insertImage('li #reload','reloadButton.png');
            $('#youtubeCommentQuiz li #reload').append('<span>');
        }        
        // Update indicator span.
        $('#youtubeCommentQuiz li #reload span').html(reloads);
    // If there are no more reloads.
    }
    if(reloads<=0){        
        // In case the reload element already exists.
        if($('#youtubeCommentQuiz #reload').length){
            // Destroy the reload element.
            window.setInterval("$('#youtubeCommentQuiz #reload').fadeOut('slow')", 100);
        }
    }    
    
    // Evaluate the winner video and display it incl. comment.
    var winnerVideo = randomFromTo(1, 3);    
    var a = 1;
    while(a<4){        
        if(a == winnerVideo){
          displayVideosAndComment(a,true);        
        }else{
          displayVideosAndComment(a,false);
        }
        a++;  
    }
    
    // Checks how many players are successfully loaded.
    $.tubeplayer.defaults.afterReady = function($player){
        loadedTubeplayers++;
        consoleMessage('loadedTubeplayers: ' + loadedTubeplayers);
        if(loadedTubeplayers == 3){
            // Now you can interact.
            allowInteracting();
            consoleMessage('Now, go on interacting.');
        }        
    }   
    
    // Return the number of the winner video.
    return winnerVideo;

};
/* --------------------------------------------- /quizStage ------------------------------------------ */
/* ------------------------------------------- tempResultStage --------------------------------------- */
// Create temporary result stage (no expression for "Zwischenergebnis" in english?!).
function createTempResultStage(targetStage,correctAnswer){
    
    // Fill the stage with template markup.
    targetStage.append($('#stageTemplate').html());
    
    // Add indicator bars, globally set (means also the invisible template DOM).
    $('#youtubeCommentQuiz .stageMiddle').append($('#resultIndicatorTemplate').html());  
    
    // Add motivation titles.
    if(correctAnswer){
        $('#youtubeCommentQuiz .stageTop').html('<span class="green"></span>');
        $('#youtubeCommentQuiz .stageTop span').text(winnerArray[randomFromTo(0,2)]);           
    
    // Update indicator bars.
    window.setTimeout('updateIndicatorBars(true)',carouselDuration*2);
    }else{
        $('#youtubeCommentQuiz .stageTop').html('<span class="red"></span>');
        $('#youtubeCommentQuiz .stageTop span').text(loserArray[randomFromTo(0,2)]);
    // Update indicator bars.
    window.setTimeout('updateIndicatorBars(false)',carouselDuration*2);
    }
    
    // Create next button.
    $('#youtubeCommentQuiz .stageBottomBottom').html('<span class="big">Next</span>');
    
    // Add '.nextStage' to start button.
    $('#youtubeCommentQuiz .stageBottomBottom span').addClass('nextStage');
              
    // Kill unneeded DOM.
    $('#youtubeCommentQuiz .stageBottomTop').remove();
    // Manipulate DOM.
    $('#youtubeCommentQuiz .stageBottomBottom').css('padding-bottom',45);
}

// Destroy tempResultStage.
function destroyTempResultStage(currentStage){   
    // Remove '.nextStage' from #next.
    currentStage.children('.stageBottomBottom span').removeClass('nextStage');        
    // Remove DOM completely.
    currentStage.children('.stage').remove();
    consoleMessage('tempResultStage killed.');
}
/* ------------------------------------------ /tempResultStage --------------------------------------- */
/* --------------------------------------------- resultStage ----------------------------------------- */
// Create resultStage.
function createResultStage(targetStage){
    
    // Fill the stage with template markup.
    targetStage.append($('#stageTemplate').html());
    // Add class 'resultStage' for safe referencing.
    targetStage.children('.stage').addClass('resultStage');
    
    // Apply BG images to stage.
    applyBackgroundImage('.resultStage .stageTop','stageBackgroundImage.jpg');
    applyBackgroundImage('.resultStage .stageMiddle','stageBackgroundImage.jpg');
    
    // Play theme.
    window.setTimeout('playTheme()',carouselDuration);
    
    // Set resultIndicator to needed height.
    if(rightAnswers==0 || wrongAnswers==0){
        $('.resultIndicator').css('height',80);    
    }else{
        $('.resultIndicator').css('height',160);
    }
    
    // Add title.
    var statement = '...';
    $('.resultStage .stageTop').html('<span></span>');
    if(rightAnswers>wrongAnswers){ statement = resultWinnerArray[randomFromTo(0,2)]; }
    if(rightAnswers<wrongAnswers){ statement = resultLoserArray[randomFromTo(0,2)]; }
    $('.resultStage .stageTop span').text(statement);
    
    // Add indicator bars, globally set (means also the invisible template DOM).
    $('.resultStage .stageMiddle').append($('#resultIndicatorTemplate').html());              
    // Kill unneeded DOM.
    $('.resultStage .resultIndicatorBottom').remove();
    
    // Add share buttons and apply BG images and titles.
    $('.resultStage .stageBottomTop').html('<div id="facebook"></div><div id="twitter"></div>');
    applyBackgroundImage('.resultStage #facebook','shareButtons.png');
    $('#facebook').attr('title','Share on facebook');
    applyBackgroundImage('.resultStage #twitter','shareButtons.png');
    $('#twitter').attr('title','Share your result on twitter');
    
    // Add share listeners and functions.
    $('.resultStage #facebook').click(function()
    {
        var encodedURL = encodeURIComponent( 'http://' + URLIdentifier );
        var shareURL = 'http://www.facebook.com/sharer.php?u=' + encodedURL;
        window.open( shareURL );
        return false;
    });
    $('.resultStage #twitter').click(function()
    {
        var shareText = 'I got ' + rightAnswers + ' out of ' + numberOfQuestions + ' on youtubeCommentQuiz - http://' + URLIdentifier;
        var encodedURL = encodeURIComponent( shareText );
        var shareURL = 'http://twitter.com/home?status=' + encodedURL;
        window.open( shareURL );
        return false;
    });
    
    // Add again button.
    $('.resultStage .stageBottomBottom').html('<span class="again">Another try?</span>');
    // Add listener to again button.
    $('.again').live('click',function(){
        window.location.reload();
    });
    
    
}
/* -------------------------------------------- /resultStage ----------------------------------------- */
/* -------------------------------------------- DOM READY -------------------------------------------- */

$(document).ready(function(){
    // Init SoundCloud object, see http://developers.soundcloud.com/docs/javascript-sdk#getting-started.
    SC.initialize({ 
        client_id: soundcloudAPIKey        
    });
    
    // It´s recommended to put this on top, see http://developers.soundcloud.com/docs/javascript-sdk#streaming.
    SC.whenStreamingReady(function(){  
       
        // Apply BG image to body.
        applyBackgroundImage('body','bodyBackgroundImage.jpg'); 
        
        // Make template visible / Build the template.
        $('#youtubeCommentQuiz').removeClass('displayNone');
        
        numberOfStages = 1+(numberOfQuestions*2)+2; // loadingStage + welcomeStage + X*(questions + tempResult) + Result.
        
        // Create stages sceleton DOM (li).
        i=0;
        while(i<numberOfStages){
            $('#youtubeCommentQuiz').append('<li>');
            i++;
        }
        
        // Initialize jCarousel.
        jQuery('#youtubeCommentQuiz').jcarousel({
               visible: 1,
               buttonNextHTML:null,
               buttonPrevHTML:null,
               scroll: 1,
               animation: carouselDuration,
               initCallback: controlFunctions
        });
        
        // Create loading stage.
        createLoadingStage();
        
        fitStageElements(); // Fit elements.
        
        // Fit fullsize to screen.
        resizeCarouselHeight();
         
    });
});
/* -------------------------------------------- /DOM READY -------------------------------------------- */
/* --------------------------------------------- window Resize ---------------------------------------- */
$(window).resize(function() {								   
  resizeCarouselHeight();
  fitStageElements();
});
/* -------------------------------------------- /window Resize ---------------------------------------- */