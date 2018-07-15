function SoundEvent(name, time, type, options) {
  this.name = name;
  this.start = moment(time);
  this.type = type;

  this.prev_chk = moment(now);


  this.played = false;

  /*
    IDEA: Consider pushing this to be handled in the manager
  */
  this.settings = {
    $tts_chk: "",
    $tts_txt: "",
    $tts_btn: "",
    $snd_chk: "",
    $snd_btn: "",
    snd_file: "data/woodblock.mp3"
  };
  this.settings = extend(this.settings, options);

  // Update the preview buttons
  this.settings.$snd_btn.unbind("click");
  this.settings.$snd_btn.click($.proxy(this.playSound, this));

  this.settings.$tts_btn.unbind("click");
  this.settings.$tts_btn.click($.proxy(this.playTTS, this));
}

SoundEvent.prototype.tick = function() {
  if (!this.played && this.isEventNow()) {
    if (this.isTTSEnabled()) {
      this.playTTS();
    }
    if (this.isSoundEnabled()) {
      this.playSound();
    }
    this.played = true;
  }
};

SoundEvent.prototype.isEventNow = function() {
  var check = moment(now);
  var result = (this.start > this.prev_chk && this.start < check);

  this.prev_chk = moment(now);
  return result;
};

SoundEvent.prototype.playTTS = function() {
  if (!sound_manager.isTTSCompatible()) {
    console.log("SoundEvent: Browser not TTS compatible.");
    return;
  }

  var msg = this.settings.$tts_txt.val();
  msg = msg.replace("[name]", this.name);

  msg = new SpeechSynthesisUtterance(msg);
  msg.volume = sound_manager.getTTSVolume();

  var voice = sound_manager.getTTSVoice();
  if (voice) {
    msg.voice = voice;
  }

  window.speechSynthesis.speak(msg);
};

SoundEvent.prototype.playSound = function() {
  if (!sound_manager.isSoundCompatible()) {
    console.log("SoundEvent: Browser not mp3 compatible.");
    return;
  }

  var file = this.settings.snd_file;
  var audi = new Audio(file);
  audi.volume = sound_manager.getSoundVolume();
  audi.play();
};

SoundEvent.prototype.isTTSEnabled = function() {
  if (!sound_manager.isTTSCompatible()) {
    return false;
  }

  var $sel = this.settings.$tts_chk;
  return $sel.is(":checked");
};

SoundEvent.prototype.isSoundEnabled = function() {
  if (!sound_manager.isSoundCompatible()) {
    return false;
  }

  var $sel = this.settings.$snd_chk;
  return $sel.is(":checked");
};
