# BasicDoughnutChart 

A small library for simple doughnut or pie charts 

You can test it out here: https://itchiii.github.io/BasicDoughnutChart/

## What is possible? 
* Create a doughnut chart
* Set a higher stroke width to create a pie chart
* Decide if labels should shown or not
* Set individual colors for each segment
* Create a effect to show a border on a segment
* The border can be static or shown when hovering
* Set individual class names for each segment
* Set a margin between the segments

## Installation

1. Just download the `BasicDoughnutChart.mjs` and the `BasicDoughnutChart.css` file. Or both as minify version in the `build` folder.

2. Import the `BasicDoughnutChart` Class into your script file.
    ```js
    import { BasicDoughnutChart } from './BasicDoughnutChart.mjs';
    ```

3. Link the css file into your html file.
    ```html
    <link rel="stylesheet" href="BasicDoughnutChart.css">
    ```

4. Create an empty element in your html file with an id.
    ```html
    <figure id="bdc"></figure>
    ```

5. Create a new instance of the BasicDoughnutChart Class and set some options and the data.
    ```js
    const doughnut = new BasicDoughnutChart('bdc', {
      height: 350,
      width: 350,
      strokeWidth: 40,
      borderEffect: {
        strokeWidth: 7,
        distance: 7,
      }
    },
      {
        values: [17, 19, 7, 20, 37],
        colors: ['#90f1ef', '#ffd6e0', '#ffef9f', '#c1fba4', '#7bf1a8'],
        actives: [false, true, false, false, false],
      }
    );
    ```

6. Draw your new doughnut chart
    ```js
    doughnut.draw();
    ```

