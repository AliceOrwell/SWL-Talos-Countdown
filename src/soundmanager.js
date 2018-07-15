/*
  A crude sound manager to deal with sound events
*/
function SoundManager() {
  this.golem = undefined;
  this.$tts_voices = $("#tts_voices");
  this.$tts_volume = $("#tts_volume");
  this.$snd_volume = $("#snd_volume");
  this.sound_events = [];

  this.se_settings_grace = {
    $tts_chk: $("#chk_tts_grace"),
    $tts_txt: $("#txt_tts_grace"),
    $tts_btn: $("#btn_tts_grace"),
    $snd_chk: $("#chk_snd_grace"),
    $snd_btn: $("#btn_snd_grace")
  };
  this.se_settings_spawn = {
    $tts_chk: $("#chk_tts_spawn"),
    $tts_txt: $("#txt_tts_spawn"),
    $tts_btn: $("#btn_tts_spawn"),
    $snd_chk: $("#chk_snd_spawn"),
    $snd_btn: $("#btn_snd_spawn")
  };

}

SoundManager.prototype.isSoundCompatible = function() {
  /*
  Check to see if the browser supports HTML5 mp3 playback
  Taken from: http://diveintohtml5.info/everything.html
  */
  var a = document.createElement('audio');
  return !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
};

SoundManager.prototype.isTTSCompatible = function() {
  /*
  Check to see if the browser supports speech synthesis
  Make sure there's voices too since an OS may not come with any... Looking at
  you Lubuntu!
  */
  if ('speechSynthesis' in window) {
    if (speechSynthesis.getVoices().length > 0) {
      return true;
    }
  }
  return false;
};

SoundManager.prototype.getTTSVoice = function() {
  var index = this.$tts_voices.find("option:selected").index();
  var voices = window.speechSynthesis.getVoices();
  if (index >= 0 && index < voices.length) {
    return voices[index];
  }
  return false;
};

SoundManager.prototype.getTTSVolume = function() {
  var volume = this.$tts_volume.val();
  volume = volume / 100.0;
  return volume;
};

SoundManager.prototype.populateTTSVoices = function($elem) {
  if ($elem.find("option").length == 0) {
    var voices = window.speechSynthesis.getVoices();
    var option = '';
    for (var i=0; i < voices.length; i++){
      option += '<option value="'+ i + '">' + voices[i].name + '</option>';
    }
    $elem.append(option);
  }
};

SoundManager.prototype.getSoundVolume = function() {
  var volume = this.$snd_volume.val();
  volume = volume / 100.0;
  return volume;
};

SoundManager.prototype.register = function(golem) {
  if (!this.isTTSCompatible() && !this.isSoundCompatible()) {
    return;
  }

  // if nothing registered
  // if a newer one (we expect to only be given the next)
  if (!this.golem || golem.when > this.golem.when) {
    this.golem = golem;
    var name = golem.name;

    var grace = new SoundEvent(name, this.golem.window.getStart(), "Grace", this.se_settings_grace);
    var spawn = new SoundEvent(name, this.golem.window.getGraceEnd(), "Spawn", this.se_settings_spawn);
    this.sound_events = [grace, spawn];
  }
};

SoundManager.prototype.tick = function() {
  for (var i=0; i < this.sound_events.length; i++) {
    this.sound_events[i].tick();
  }
};
