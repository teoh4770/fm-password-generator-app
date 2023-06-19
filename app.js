(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = {
  numbers: "0123456789",
  uppercases: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercases: "abcdefghijklmnopqrstuvwxyz",
  symbols: '!"#$%&)(*+,-./',
};

},{}],2:[function(require,module,exports){
const characters = require("./characters.js");
const passwordTest = require("./zxcvbnts-setting.js");

class App {
  constructor() {
    this.characters = characters;
    this.placeholder = "P4$5WOrD!";

    this.passwordSetting = {
      number: true,
      uppercase: true,
      lowercase: false,
      symbol: false,
    };

    // separate this
    this.passwordLength = 10;

    this.password = "";
    this.passwordStrength = 0;
    this.passwordStrengthText = "";

    // form in general
    this.$form = document.querySelector(".js-form");

    // textbox with button
    this.$passwordResultText = document.querySelector(
      ".js-password__display-text"
    );
    this.$passwordCopyBtn = document.querySelector(".js-password__copy");
    this.$alertSuccessBox = document.querySelector(".js-copy-message");

    // input range
    this.$passwordLengthLabel = document.querySelector(".js-char_length-label");
    this.$passwordLengthRangeInput = document.querySelector(".js-range");

    // checkboxes
    this.$passwordCheckboxes = document.querySelectorAll(
      ".password__checkbox > input"
    );

    // strength indicator
    this.$passwordStrengthBarsContainer = document.querySelector(
      ".js-password__strength-bars"
    );
    this.$passwordStrengthBars = document.querySelectorAll(
      ".password__strength-bar"
    );

    // button
    this.$submitBtn = document.querySelector(".js-password__button");

    this.initialize();
    this.handleEvents();
  }

  initialize() {
    this.$passwordLengthRangeInput.setAttribute("value", this.passwordLength);
    this.$passwordLengthLabel.setAttribute("data-content", this.passwordLength);
    this.$passwordStrengthBarsContainer.setAttribute("data-content", "");
    this.updatePassword();
  }

  handleEvents() {
    this.$form.addEventListener("submit", (event) => {
      event.preventDefault();
    });

    this.$form.addEventListener("click", (e) => {
      this.copyPassword(e);
      this.updatePassword(e);
    });

    this.$passwordLengthRangeInput.addEventListener("input", (event) => {
      this.updateCharacterLength(event);
      this.updatePassword();
    });

    this.$passwordCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        this.handleCheckbox(e);
      });
    });
  }

  updateCharacterLength(event) {
    this.passwordLength = +event.target.value;
    this.$passwordLengthLabel.setAttribute("data-content", this.passwordLength);
  }

  handleCheckbox(event) {
    const checkbox = event.target;
    const checkboxState = checkbox.checked;

    switch (checkbox.id) {
      case "uppercase":
        this.passwordSetting = {
          ...this.passwordSetting,
          uppercase: checkboxState,
        };
        break;
      case "lowercase":
        this.passwordSetting = {
          ...this.passwordSetting,
          lowercase: checkboxState,
        };
        break;
      case "number":
        this.passwordSetting = {
          ...this.passwordSetting,
          number: checkboxState,
        };
        break;
      case "symbol":
        this.passwordSetting = {
          ...this.passwordSetting,
          symbol: checkboxState,
        };
        break;
    }
    this.updatePassword();
  }

  handleButtonState() {
    const isCheckboxChecked = [...this.$passwordCheckboxes].some(
      (checkbox) => checkbox.checked
    );
    const isCharacterLengthSet = this.passwordLength > 0;

    isCheckboxChecked && isCharacterLengthSet
      ? this.$submitBtn.removeAttribute("disabled")
      : this.$submitBtn.setAttribute("disabled", "");
  }

  handlePasswordResultText() {
    if (this.password !== "" && this.hasPasswordSetting) {
      this.$passwordResultText.textContent = this.password;
      this.$passwordResultText.classList.remove("no-password");
    } else {
      this.$passwordResultText.textContent = this.placeholder;
      this.$passwordResultText.classList.add("no-password");
    }
  }

  // this is clearer than handlePasswordCopy
  copyPassword(e) {
    const duration = 5;
    const copyBtnSelector = ".js-password__copy";
    const copyBtn = e.target.closest(copyBtnSelector);

    if (!copyBtn) return;
    this.copyPasswordToClipBoard();
    this.showAlertSuccessBox(duration);
  }

  // characters
  copyPasswordToClipBoard() {
    if (this.password === "") return;
    // copy the password
    navigator.clipboard.writeText(this.password);
  }

  showAlertSuccessBox(duration) {
    this.$alertSuccessBox.classList.add("active");
    setTimeout(() => {
      this.$alertSuccessBox.classList.remove("active");
    }, duration * 1000);
  }

  handlePasswordCopyState() {
    if (this.password !== "") {
      this.$passwordCopyBtn.classList.add("active");
    } else {
      this.$passwordCopyBtn.classList.remove("active");
    }
  }

  updatePassword(e = null) {
    let submitBtnSelector = "";
    let submitBtn = null;
    let isPassWordMatchConditions = false;
    if (e) {
      submitBtnSelector = ".js-password__button";
      submitBtn = e.target.closest(submitBtnSelector);
    }

    if (e && !submitBtn) return;

    this.password = this.createPassword();
    isPassWordMatchConditions = this.checkPassword();
    // if (!isPassWordMatchConditions) {
    //   this.updatePassword(e);
    // }

    this.handlePasswordResultText();
    this.handlePasswordCopyState();
    this.handleStrengthIndicator();
    this.handleButtonState();
  }

  createPassword() {
    let characters = this.getCharacters();
    let passwordSize = this.passwordLength;
    let password = "";
    const list = this.formRandomNumberList(passwordSize, characters.length - 1);

    for (let index of list) {
      password += characters.charAt(index);
    }

    return password;
  }

  // since the generated password may not match the conditions, i have to double check
  // and regenerate a new one until it match
  checkPassword() {
    if (this.password.length < 6) return true;

    let passwordSetting = [
      {
        setToTrue: this.passwordSetting.uppercase,
        regex: /[A-Z]/,
      },
      {
        setToTrue: this.passwordSetting.lowercase,
        regex: /[a-z]/,
      },
      {
        setToTrue: this.passwordSetting.symbol,
        regex: /[!"#$%&)(*+,-./]/,
      },
      {
        setToTrue: this.passwordSetting.number,
        regex: /\d/,
      },
    ];

    passwordSetting.forEach((setting) => {
      if (setting.setToTrue) {
        let passwordIsIncorrect = !setting.regex.test(this.password);
        if (passwordIsIncorrect) return false;
      }
    });

    return true;
  }

  getPasswordStrength() {
    const passwordStrength = passwordTest(this.password).score;
    let passwordStrengthText = null;

    switch (passwordStrength) {
      case 0:
        passwordStrengthText = "Too Weak!";
        break;
      case 1:
        passwordStrengthText = "Weak";
        break;
      case 2:
        passwordStrengthText = "Medium";
        break;
      case 3:
      case 4:
        passwordStrengthText = "Strong";
        break;
    }

    return { passwordStrength, passwordStrengthText };
  }

  handleStrengthIndicator() {
    if (this.passwordLength === 0 || !this.hasPasswordSetting) {
      this.$passwordStrengthBars.forEach((bar) => {
        bar.classList.remove("active");
      });
      this.$passwordStrengthBarsContainer.setAttribute("data-strength", "");
      this.$passwordStrengthBarsContainer.setAttribute("data-content", "");
      return;
    }

    let { passwordStrength, passwordStrengthText } = this.getPasswordStrength(
      this.password
    );
    this.passwordStrengthText = passwordStrengthText;
    this.passwordStrength = passwordStrength;

    this.$passwordStrengthBarsContainer.setAttribute(
      "data-content",
      this.passwordStrengthText
    );
    this.$passwordStrengthBarsContainer.setAttribute(
      "data-strength",
      this.passwordStrength
    );

    this.$passwordStrengthBars.forEach((bar, barIndex) => {
      bar.classList.remove("active");
      if (barIndex <= this.passwordStrength) {
        bar.classList.add("active");
      }
    });
  }

  getCharacters() {
    let { numbers, uppercases, lowercases, symbols } = this.characters;
    let characters = "";

    characters = this.passwordSetting.number
      ? characters.concat(numbers)
      : characters;
    characters = this.passwordSetting.uppercase
      ? characters.concat(uppercases)
      : characters;
    characters = this.passwordSetting.lowercase
      ? characters.concat(lowercases)
      : characters;
    characters = this.passwordSetting.symbol
      ? characters.concat(symbols)
      : characters;

    return characters;
  }

  hasPasswordSetting() {
    return Object.values(this.passwordSetting).some(
      (setting) => setting === true
    );
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
  // https://stackoverflow.com/questions/18230217/javascript-generate-a-random-number-within-a-range-using-crypto-getrandomvalues
  formRandomNumberList(arraySize = 20, max, min = 0) {
    const randomBuffers = new Uint32Array(arraySize);
    self.crypto.getRandomValues(randomBuffers);

    const array = [];
    for (let num of randomBuffers) {
      let randomNumber = num / (0xffffffff + 1); // generate number between 0 and 1
      min = Math.ceil(min);
      max = Math.floor(max);
      let result = Math.floor(randomNumber * (max - min + 1)) + min;
      array.push(result);
    }

    return array;
  }
}

new App();

},{"./characters.js":1,"./zxcvbnts-setting.js":3}],3:[function(require,module,exports){
//https://zxcvbn-ts.github.io/zxcvbn/guide/getting-started/#output

// all package will be available under zxcvbnts
// getting the password strength
const options = {
  translations: zxcvbnts["language-en"].translations,
  graphs: zxcvbnts["language-common"].adjacencyGraphs,
  dictionary: {
    ...zxcvbnts["language-common"].dictionary,
    ...zxcvbnts["language-en"].dictionary,
  },
};
zxcvbnts.core.zxcvbnOptions.setOptions(options);

module.exports = function (password) {
  return zxcvbnts.core.zxcvbn(password);
};

},{}]},{},[2]);
