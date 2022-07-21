let grids = new Set();
let cell_size = 24;
let height = window.innerHeight;
let width = window.innerWidth;
let nx = Math.floor(width / cell_size);
let ny = Math.floor(height / cell_size);
let canvas = document.querySelector("#mycanvas");
let ctx = canvas.getContext("2d");
let drag = false;
let dragged = new Set();

let cell_color = "#FF007F";

let cellSizeInput = document.querySelector("#cell-size-input");
let cellColorInput = document.querySelector("#cell-color-input");
let cellColorPreview = document.querySelector("#cell-color-preview");
let applySettingButton = document.querySelector("#apply-button");
let clearBoardButton = document.querySelector("#clear-button");
let exportButton = document.querySelector("#export-button");
let importButton = document.querySelector("#import-button");
let saveButton = document.querySelector("#save-button");
cellColorPreview.style.backgroundColor = cell_color;

Object.assign(String.prototype, {
  pad(size) {
    let s = this;
    while (s.length < size) {
      s = "0" + s;
    }
    return s;
  },
});

class Preset {
  constructor(width, height, grids) {
    // grids = array of object (what you get when copying the set from console)
    this.width = width;
    this.height = height;
    this.grids = grids;
  }
}

class Preset8 {
  constructor(width, height, arr) {
    //arr = arr of 8 bit number that represent the boolean matrix
    this.width = width;
    this.height = height;
    this.arr = arr;
  }
}

let presets = {
  pikachu: {
    width: 35,
    height: 25,
    arr: [
      0, 3, 248, 0, 0, 3, 128, 224, 0, 7, 128, 3, 192, 3, 0, 0, 6, 1, 128, 0, 0,
      48, 64, 0, 0, 65, 24, 3, 1, 136, 55, 153, 130, 12, 207, 253, 0, 0, 23,
      224, 32, 28, 2, 0, 9, 135, 195, 32, 1, 120, 136, 244, 0, 47, 17, 30, 128,
      4, 194, 57, 144, 0, 64, 60, 130, 0, 8, 0, 136, 128, 1, 128, 8, 144, 0, 32,
      0, 142, 0, 4, 7, 209, 64, 0, 128, 113, 8, 0, 32, 0, 33, 0, 4, 0, 0, 16, 0,
      128, 0, 2, 0, 0, 0, 0, 64, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
    ],
  },
  ">o<": {
    width: 18,
    height: 13,
    arr: [
      192, 0, 204, 0, 192, 128, 64, 192, 12, 192, 0, 192, 0, 5, 0, 42, 152, 101,
      9, 228, 2, 1, 0, 128, 64, 39, 144, 6, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0,
    ],
  },
  uwu: {
    width: 20,
    height: 9,
    arr: [
      68, 1, 20, 80, 81, 69, 5, 20, 72, 145, 108, 169, 179, 133, 14, 0, 0, 5,
      64, 21, 168, 2, 160, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
    ],
  },
};

let userPresets = JSON.parse(localStorage.getItem("userPresets")) || {};

let drawBorder = () => {
  ctx.beginPath();
  for (let i = 1; i <= ny; i++) {
    ctx.moveTo(0, i * cell_size + 1);
    ctx.lineTo(width, i * cell_size - 1);
  }
  for (let i = 1; i <= nx; i++) {
    ctx.moveTo(i * cell_size + 1, 0);
    ctx.lineTo(i * cell_size + 1, height);
  }
  ctx.strokeStyle = "#00FFFF";
  ctx.lineWidth = 2;
  ctx.stroke();
};

let drawCell = (cord) => {
  ctx.fillStyle = cell_color;
  x = cord.split("-")[0];
  y = cord.split("-")[1];
  ctx.fillRect(
    cell_size * x + 1,
    cell_size * y + 1,
    cell_size - 1,
    cell_size - 1
  );
  ctx.stroke();
};

let eraseCell = (cord) => {
  x = cord.split("-")[0];
  y = cord.split("-")[1];
  ctx.clearRect(
    cell_size * x + 1,
    cell_size * y + 1,
    cell_size - 1,
    cell_size - 1
  );
  ctx.stroke();
};

let resizeCanvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  width = window.innerWidth;
  height = window.innerHeight;
  nx = Math.floor(width / cell_size);
  ny = Math.floor(height / cell_size);
  drawBorder();
  drawAll();
};

let handleMouseClick = (event, bypassDragCheck = false) => {
  if (!drag && !bypassDragCheck) return;
  const rect = canvas.getBoundingClientRect();
  x = event.clientX - rect.left;
  y = event.clientY - rect.top;
  posXY = `${Math.floor(x / cell_size)}-${Math.floor(y / cell_size)}`;
  if (dragged.has(posXY)) {
    return;
  } else {
    dragged.add(posXY);
  }
  if (grids.has(posXY)) {
    grids.delete(posXY);
    eraseCell(posXY);
  } else {
    grids.add(posXY);
    drawCell(posXY);
  }
};

let clearBoard = (clearGrid = true) => {
  if (clearGrid) {
    grids = new Set();
  }
  ctx.beginPath();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.stroke();
  drawBorder();
};

let drawAll = () => {
  ctx.beginPath();
  for (let cord of grids) {
    drawCell(cord);
  }
};

let loadPreset = (preset) => {
  clearBoard();

  const offsetX = Math.floor(nx / 2 - preset.width / 2);
  const offsetY = Math.floor(ny / 2 - preset.height / 2);
  let x = offsetX;
  let y = offsetY;
  preset.arr.forEach((bitNum) => {
    const binary = bitNum.toString(2).pad(8);
    console.log(binary);
    for (let i = 0; i < 8; i++) {
      if (binary[i] === "1") {
        grids.add(`${x}-${y}`);
      }
      x++;
      if (offsetX + preset.width <= x) {
        x = offsetX;
        y++;
      }
    }
  });
  drawAll();
};

let loadPresetName = (name) => {
  const preset = presets[name];
  loadPreset(preset);
};

let loadUserPresetName = (name) => {
  const preset = userPresets[name];
  loadPreset(preset);
};

let delUserPresetName = (name) => {
  delete userPresets[name];
  localStorage.setItem("userPresets", JSON.stringify(userPresets));
};

let getPresetDOM = (name, type) => {
  const element = document.createElement("div");
  const loadbutton = document.createElement("button");
  loadbutton.textContent = name;
  if (type === "user") {
    loadbutton.addEventListener("click", () => {
      loadUserPresetName(name);
    });
  } else {
    loadbutton.addEventListener("click", () => {
      loadPresetName(name);
    });
  }
  element.appendChild(loadbutton);
  if (type === "user") {
    const delbutton = document.createElement("button");
    delbutton.textContent = "delete";
    delbutton.setAttribute("class", "delbutton");
    delbutton.addEventListener("click", () => {
      delUserPresetName(name);
    });
    element.appendChild(delbutton);
  }
  return element;
};

let addPresetMenu = (name) => {
  const presetDOM = document.querySelector("#preset");
  const element = getPresetDOM(name, "");
  presetDOM.appendChild(element);
};

let addUserPresetMenu = (name) => {
  const presetDOM = document.querySelector("#user-preset");
  const element = getPresetDOM(name, "user");
  presetDOM.appendChild(element);
};

let makePreset = (name) => {
  const [X, Y, W, H] = getWH();
  let arr = [];
  let num = 0;
  let bit = 7;
  for (let y = Y; y < Y + W; y++) {
    for (let x = X; x < X + W; x++) {
      if (bit === -1) {
        arr.push(num);
        bit = 7;
        num = 0;
      }
      if (grids.has(`${x}-${y}`)) {
        num |= 1 << bit;
      }
      bit--;
    }
  }
  if (bit !== -1) {
    arr.push(num);
  }
  return new Preset8(W, H, arr);
};

let exportPreset = () => {
  const name = prompt("Name this preset");
  let preset;

  preset = makePreset(name);
  const exportString = JSON.stringify({ name: name, data: preset });

  navigator.clipboard.writeText(exportString).then(
    () => {
      alert("Copied to clipboard");
    },
    function (err) {
      textToClipboard(exportString);
      alert("I am not sure if copy to clipboard worked, check that");
    }
  );
};

let importPreset = () => {
  const presetString = prompt("Input your preset", "");
  if (presetString == null || presetString == "") {
    return;
  }
  const presetObj = JSON.parse(presetString);
  loadPreset(presetObj.data);
  savePreset(presetObj.name);
};

let getWH = () => {
  // return [X, Y, W, H]
  presetArr = Array.from(grids);
  let minX = 1e9;
  let minY = 1e9;
  let maxX = 0;
  let maxY = 0;
  for (const cord of presetArr) {
    const x = parseInt(cord.split("-")[0]);
    const y = parseInt(cord.split("-")[1]);
    minX = Math.min(x, minX);
    minY = Math.min(y, minY);
    maxX = Math.max(x, maxX);
    maxY = Math.max(y, maxY);
  }

  return [minX, minY, maxX - minX + 1, maxY - minY + 1];
};

let savePreset = (name = "") => {
  if (name === "") {
    name = prompt("Name this preset");
  }
  let preset = makePreset(name);
  userPresets[name] = preset;
  localStorage.setItem("userPresets", JSON.stringify(userPresets));
  addUserPresetMenu(name);
};

for (const [key, preset] of Object.entries(presets)) {
  addPresetMenu(key);
}

for (const [key, preset] of Object.entries(userPresets)) {
  addUserPresetMenu(key);
}

resizeCanvas();

canvas.addEventListener("mousedown", () => {
  drag = true;
});

canvas.addEventListener("mouseup", () => {
  drag = false;
  dragged = new Set();
});

canvas.addEventListener("mousemove", handleMouseClick);
canvas.addEventListener("click", (event) => {
  handleMouseClick(event, (bypassDragCheck = true));
});
window.addEventListener("resize", resizeCanvas, false);

cellSizeInput.value = cell_size;
cellColorInput.value = cell_color;

exportButton.addEventListener("click", (event) => {
  exportPreset();
});

importButton.addEventListener("click", (event) => {
  importPreset();
});

saveButton.addEventListener("click", (event) => {
  savePreset();
});

cellColorInput.addEventListener("input", () => {
  cellColorPreview.style.backgroundColor = cellColorInput.value;
});

applySettingButton.addEventListener("click", (event) => {
  cell_size = parseInt(cellSizeInput.value);
  if (cell_size === 0) {
    alert("You cannot divide by 0, dum");
    return;
  }
  nx = Math.floor(width / cell_size);
  ny = Math.floor(height / cell_size);
  cell_color = cellColorInput.value;
  clearBoard((clearGrid = false));
  drawAll();
});

clearBoardButton.addEventListener("click", (event) => {
  clearBoard();
});

let textToClipboard = (text) => {
  var dummy = document.createElement("textarea");
  document.body.appendChild(dummy);
  dummy.value = text;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
};
