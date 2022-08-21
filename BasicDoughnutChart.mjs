export class BasicDoughnutChart {
  constructor(id, givenOptions, givenData) {
    // define default for arc chart
    // without units
    this.default = {
      options: {
        height: 0,
        width: 0,
        //change the strokewidth in your config to create a pie chart, depends on the size and the border distance
        strokeWidth: 40,
        margin: 0,
        labels: true,
        borderEffect: {
          strokeWidth: 0,
          distance: 0, //< 0 will create a stroke width animation 
        }
      },
      data: {
        values: [],
        actives: [],
        classes: [],
        colors: []
      }
    };

    this.id = id;
    this.options = this.getOptions(givenOptions);
    this.data = this.getData(givenData);
    this.chart = document.getElementById(this.id);
    this.classes = this.defineClassesForElements();
    this.ids = this.defineIdsForElements();

    if (this.data.colors.length === 0) this.createRandomColors();
  }

  /**
   * merging the given and the default options together
   * @param {Object} given 
   * @returns {Object} object containing all options
   */
  getOptions = (given = {}) => {
    return { ...this.default.options, ...given };
  };

  /**
   * merging the given and the default data together
   * data can be commited in percent or absoulte number
   * if the given numbers are absoulte, the numbers will be calculated in percent 
   * @param {Object} given 
   * @returns {Object} object containing all data information
   */
  getData = (given) => {
    let data = { ...this.default.data, ...given }
    const totalValue = data.values.reduce((total, num) => total + num);
    if (totalValue !== 100) data.values = data.values.map(val => val / totalValue * 100);
    return data;
  }

  /**
   * define class names for styling in BEM format
   * @returns {Object} object with classnames for specifc elements
   */
  defineClassesForElements = () => {
    return {
      wrapper: "bdc__wrapper",
      path: "bdc__path",
      pathActive: "bdc__path--active",
      borderWrapper: "bdc__wrapper-border",
      border: "bdc__border",
      borderShow: "bdc__border--show",
      label: "bdc__label"
    }
  }

  /**
   * define ids if someone wants to add js to it
   * @returns {Object} object with ids for specifc elements
   */
  defineIdsForElements = () => {
    return {
      svgChart: this.id + "--element",
      clipPath: this.id + "--clipPath",
      borderWrapper: this.id + "--wrapper-border",
      borderSVG: this.id + "--border"
    }
  }

  /**
   * create random colors to fill the path segments
   * @returns class instance
   */
  createRandomColors = () => {
    for (const i of this.data.values) {
      const randomHex = `#${this.createRandomHexNumber(6)}`;
      this.data.colors.push(randomHex)
    }
    return this;
  }

  /**
   * calculate the size of the container in compliance with the optinal border and stroke
   * @returns {Number} object with width and height of chart
   */
  getTotalSizeOfChartWithoutBorder = () => {
    return {
      width: this.options.borderEffect.distance < 0 ? this.getTotalSizeOfChartWithBorder().width : this.options.width - (this.options.borderEffect.distance * 2) - (this.options.borderEffect.strokeWidth * 2),
      height: this.options.borderEffect.distance < 0 ? this.getTotalSizeOfChartWithBorder().height : this.options.height - (this.options.borderEffect.distance * 2) - (this.options.borderEffect.strokeWidth * 2)
    }
  }

  /**
   * calculate the size of the container including the border
   * @returns {Number} object with width and height of chart
   */
  getTotalSizeOfChartWithBorder = () => {
    return {
      width: this.options.width - this.options.borderEffect.strokeWidth,
      height: this.options.height - this.options.borderEffect.strokeWidth
    }
  }

  /**
   * create all elements that are necessary for the chart
   * @returns class instance
   */
  draw = () => {
    const width = this.getTotalSizeOfChartWithoutBorder().width;
    const height = this.getTotalSizeOfChartWithoutBorder().height;

    //set class and size to wrapper
    this.chart.classList.add(this.classes.wrapper);
    this.chart.style.width = this.options.width + "px";
    this.chart.style.height = this.options.height + "px";

    const chartSVG = this.createChartSVG(width, height);
    const defs = this.createClipElement(width, height);

    //create path segements
    let [rotate,loopCounter] = [0,0];
    for (const pathValue of this.data.values) {
      const pathSegment = this.createPathSegments(pathValue, width, rotate, loopCounter);
      chartSVG.append(defs, pathSegment);

      //create labels if necessary
      if (this.options.labels) this.drawLabels(rotate, pathValue, width, height);

      rotate = rotate + pathValue;
      loopCounter++;
    }

    this.chart.append(chartSVG);

    //create border if necessary
    if (this.options.borderEffect) this.drawBorder(this.chart);

    return this;
  }

  /**
   * create all elements that are necessary for the optional border
   * @returns class instance
   */
  drawBorder = () => {
    const width = this.getTotalSizeOfChartWithBorder().width;
    const height = this.getTotalSizeOfChartWithBorder().height;
    const borderSVG = this.createBorderSVG(width, height);

    //crate border path for each path segment
    for (const path of document.querySelectorAll(`#${this.ids.svgChart} > path`)) {
      const borderSegment = this.createBorderSegment(path, width);
      borderSVG.appendChild(borderSegment);
    }
    this.chart.appendChild(borderSVG);

    return this;
  }

  /**
   * create all optional labels
   * @param {Number} rotate value of current position of path segment
   * @param {Number} pathValue given path value in percent
   * @param {Number} width without border
   * @returns class instance
   */
  drawLabels(rotate, pathValue, width) {
    let x, y, angle;
    let r = width / 2 - (this.options.strokeWidth / 2);
    let angleTotal = (rotate * 3.6) + (((pathValue - this.options.margin) * 3.6) / 2);

    if (angleTotal < 90) {
      angle = angleTotal;
      y = r * Math.cos(angle * (Math.PI / 180)) * -1;
      x = (Math.sqrt(Math.pow(r, 2) - Math.pow(y, 2)));
    }
    else if (angleTotal < 180) {
      angle = angleTotal - 90;
      x = r * Math.cos(angle * (Math.PI / 180));
      y = (Math.sqrt(Math.pow(r, 2) - Math.pow(x, 2)));
    }
    else if (angleTotal < 270) {
      angle = angleTotal - 180;
      y = (r * Math.cos(angle * (Math.PI / 180)));
      x = (Math.sqrt(Math.pow(r, 2) - Math.pow(y, 2))) * -1;
    }
    else if (angleTotal < 360) {
      angle = angleTotal - 270;
      x = (r * Math.cos(angle * (Math.PI / 180))) * -1;
      y = (Math.sqrt(Math.pow(r, 2) - Math.pow(x, 2))) * -1;
    }

    const text = document.createElement('span');
    text.classList.add(this.classes.label);
    text.innerHTML = `${Math.round(pathValue)}%`;
    text.style.transform = `translateX(${x}px) translateY(${y}px)`;
    this.chart.appendChild(text);

    return this;
  }

  /**
   * show border on event listener
   * @param {SVGPathElement} path 
   */
  showBorder(path) {
    let activeBorder = document.getElementById(this.id + "--border-" + path.getAttribute("chart:path"));
    if (this.options.borderEffect.distance < 0) {
      activeBorder.style.transition = "0.4s stroke-width";
      activeBorder.style.opacity = "1";
    } else activeBorder.style.transition = "0.2s opacity";

    if (!path.classList.contains(this.classes.pathActive)) {
      activeBorder.style.strokeWidth = `${this.options.borderEffect.strokeWidth}px`;
      activeBorder.classList.toggle(this.classes.borderShow);
    }

    activeBorder.style.transform = `rotate(${path.getAttribute("chart:rotate")}deg)`;
  }

  /**
   * show border on event listener
   * @param {SVGPathElement} path 
   */
  hideBorder(path) {
    let activeBorder = document.getElementById(this.id + "--border-" + path.getAttribute("chart:path"));
    if (!path.classList.contains(this.classes.pathActive)) {
      activeBorder.style.transform = `rotate(${path.getAttribute("chart:rotate")}deg)`;
      activeBorder.classList.toggle("bdc__border--show");

      if (this.options.borderEffect.distance <= 0) activeBorder.style.strokeWidth = `${0}px`;
    }
  }

  /**
   * create the first svg Object that contains the clipPath and the path segments
   * @param {Number} width 
   * @param {Number} height 
   * @returns {SVGSVGElement} 
   */
  createChartSVG = (width, height) => {
    const chartSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    chartSVG.id = this.ids.svgChart;
    chartSVG.setAttribute("viewBox", `0 0 ${width} ${height}`);
    chartSVG.style.width = width + "px";
    chartSVG.style.height = height + "px";

    return chartSVG;
  }

  /**
   * create a path segment and return it
   * @param {Number} pathValue 
   * @param {Number} width 
   * @param {Number} rotate 
   * @param {Number} loopCounter 
   * @returns {SVGPathElement} 
   */
  createPathSegments = (pathValue, width, rotate, loopCounter) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute("chart:path", `${this.id} path-${loopCounter}`);
    path.setAttribute("d", `M${width / 2} 0 a ${width / 2} ${width / 2} 0 0 1 0 ${width} a ${width / 2} ${width / 2} 0 0 1 0 -${width}`);
    path.setAttribute("stroke", `${this.data.colors[loopCounter]}`);
    path.setAttribute("stroke-width", `${this.options.strokeWidth * 2}`);
    path.setAttribute("clip-path", `url(#${this.ids.clipPath})`);
    path.setAttribute("chart:rotate", `${rotate * 3.6}`);
    //set value as attribute to set the dasharray for border element later
    path.setAttribute("chart:value", `${pathValue}`);
    path.style.transform = `rotate(${rotate * 3.6}deg`;

    let dashArray = ((pathValue - this.options.margin) / 100) * path.getTotalLength();
    path.setAttribute("stroke-dasharray", `${dashArray}, ${path.getTotalLength()}`);

    if (this.data.classes[loopCounter]) path.classList.add(this.data.classes[loopCounter], this.classes.path);
    else path.classList.add(this.classes.path);

    if (this.data.actives[loopCounter]) path.classList.add(this.classes.pathActive);

    if (this.options.borderEffect) {
      path.addEventListener("mouseover", this.showBorder.bind(this, path));
      path.addEventListener("mouseout", this.hideBorder.bind(this, path));
    }

    return path;
  }

  /**
   * create the clip element that will cut of the stroke to a path segment
   * @param {Number} width 
   * @param {Number} height 
   * @returns {SVGDefsElement}
   */
  createClipElement = (width, height) => {
    //create defs element to store clipPath in it
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    //create clipPath element to cut the stroke off
    const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    clipPath.id = this.ids.clipPath;

    //create circle that will be the clipped element
    const clipPathCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    clipPathCircle.setAttribute("cx", `${width / 2}`);
    clipPathCircle.setAttribute("cy", `${height / 2}`);
    clipPathCircle.setAttribute("r", `${height / 2}`);

    clipPath.appendChild(clipPathCircle);
    defs.appendChild(clipPath);
    return defs;
  }

  /**
   * create the second svg Object that contains the border segments
   * @param {Number} width 
   * @param {Number} height 
   * @returns {SVGSVGElement}
   */
  createBorderSVG = (width, height) => {
    const border = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    border.id = this.ids.borderSVG;
    border.classList.add(this.classes.borderWrapper);
    border.setAttribute("viewBox", `0 0 ${width} ${height}`);
    border.style.width = width + "px";
    border.style.height = height + "px";

    return border;
  }

  /**
   * create a path segment for the border and return it
   * @param {Number} path 
   * @param {Number} width 
   * @returns {SVGPathElement} 
   */
  createBorderSegment = (path, width) => {
    const borderPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    borderPath.id = this.id + "--border-" + path.getAttribute("chart:path");
    borderPath.classList.add(this.classes.border);
    borderPath.setAttribute("d", `M${width / 2} 0 a ${width / 2} ${width / 2} 0 0 1 0 ${width} a ${width / 2} ${width / 2} 0 0 1 0 -${width}`);
    borderPath.setAttribute("stroke-width", `${this.options.borderEffect.strokeWidth}`);
    borderPath.setAttribute("stroke", `${path.getAttribute("stroke")}`);
    borderPath.style.transform = ` scale(1) rotate(${parseFloat(path.getAttribute("chart:rotate"))}deg)`;

    const array = ((parseFloat(path.getAttribute("chart:value")) - this.options.margin) / 100) * borderPath.getTotalLength();
    borderPath.setAttribute("stroke-dasharray", `${array}, ${borderPath.getTotalLength()}`);

    if (path.classList.contains(this.classes.pathActive)) borderPath.classList.toggle(this.classes.borderShow);
    else borderPath.style.strokeWidth = '0';

    return borderPath;
  }

  /**
   * could be a helpful getter to return set options and data
   * @returns object with obtions and data which are set
   */
  _getSettings() {
    return { options: this.options, data: this.data }
  }

  /**
   * could be a helpful getter to return the instance of the class
   * @returns instance of class
   */
  _getChart= () => {
    return this.chart;
  }

  /**
   * create random hex string
   * adapted from: https://stackoverflow.com/a/58326357
   * @param {*} size 
   * @returns {String} hex string
   */
  createRandomHexNumber = (size) => {
    return [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  }
}