import React from "react";
import ReactDOM from "react-dom";

const gridHeight = 20;
const gridWidth = 20;
const initialColors = [
    "#4f1a41", // purple
    "#58bee3", // light blue
    "#202327", // dark grey
    "#c0c0c0", // light grey
    "#6800ad", // vibrant purple
    "#f73a65", // bright pink
    "#2c1024" // dark purple
];
const rippleR = 5;
const fps = 10;

class Grid extends React.Component {
    constructor() {
        super();
        this.state = {
            color: "",
            request: 0,
            step: 0,
            refs: []
        };
        this.handleClick = this.handleClick.bind(this);
        this.ripple = this.ripple.bind(this);
    }
    getGrid() {
        var rows = [],
            color;
        for (var i=0; i < gridHeight; i++) {
            var cells = [];
            for (var j=0; j < gridWidth; j++) {
                if(this.state.color != "")
                    color = this.state.color;
                else
                    color = initialColors[(i+j)% initialColors.length];
                cells.push(
                    <Square key={j+','+i}
                            ref={j+'_'+i}
                            dataX={j}
                            dataY={i}
                            parentHandleClick={this.handleClick.bind(this)}
                            bgColor={color}
                            style={{padding: 5}} />
                );
            }
            rows.push(<tr key={i+"x"} dataY={i}>{cells}</tr>);
        }
        return <tbody key="tbody" >{rows}</tbody>;
    }
    // Dispatch ripple action to relevant surrounding squares when a square has been clicked
    handleClick(event) {
        var origin = event.target.dataset;

        this.setState({
            color: event.target.style.backgroundColor,
            refs: this.getAllRefs(parseInt(origin.x), parseInt(origin.y)),
            request: requestAnimationFrame(this.ripple)
        });
    }
    getAllRefs(x, y){
        var allRefs = [];
        for(var s = 1; s <= rippleR; s++) {
            //allRefs.push(this.getSquareRipple(x, y, s));
            allRefs.push(this.getCircleRipple(x, y, s));
        }
        return allRefs;
    }
    ripple(){
        //set new color for ref
        var curstep = this.state.refs[this.state.step];
        for (var ref in curstep) {
            if (curstep.hasOwnProperty(ref)) {
                this.refs[ref].changeColor(this.state.color);
            }
        }

        // loop to animate (triggers step+1 so stop at step=rippleR-2)
        if (this.state.step < rippleR-1) {
            var myGrid = this;
            // use setTimeout to manage speed of animation
            setTimeout(function() {
                myGrid.setState({
                    step: myGrid.state.step + 1,
                    request: window.requestAnimationFrame(myGrid.ripple.bind(myGrid))
                });
            }, 1000/fps);
        } else {
            cancelAnimationFrame(this.state.request);
            this.setState({
                step: 0,
                refs: []
            });
        }
    }
    getSquareRipple(x, y, s){
        var step = {};
        var xmin = x - s;
        var xmax = x + s;
        var ymin = y - s;
        var ymax = y + s;

        for (var i = xmin; i <= xmax; i++) {
            step = this.refPush(i + "_" + ymin, step);
            step = this.refPush(i + "_" + ymax, step);
        }
        for (i = ymin+1; i < ymax; i++) {
            step = this.refPush(xmin + "_" + i, step);
            step = this.refPush(xmax + "_" + i, step);
        }
        return step;
    }
    // Using Andres discrete circle drawing algorithm
    // Lucky me, the wiki page is FR only :/
    // https://fr.wikipedia.org/wiki/Algorithme_de_trac%C3%A9_de_cercle_d'Andres
    getCircleRipple(x_center, y_center, r){
        var step = {}, x = 0, y = r, d = r - 1;
        while(y >= x) {
            this.refPush(x_center + x + '_' + (y_center + y), step);
            this.refPush(x_center + y + '_' + (y_center + x), step);
            this.refPush(x_center - x + '_' + (y_center + y), step);
            this.refPush(x_center - y + '_' + (y_center + x), step);
            this.refPush(x_center + x + '_' + (y_center - y), step);
            this.refPush(x_center + y + '_' + (y_center - x), step);
            this.refPush(x_center - x + '_' + (y_center - y), step);
            this.refPush(x_center - y + '_' + (y_center - x), step);
            if(d >= 2*x){
                d = d - 2*x - 1;
                x++;
            }
            else if(d < 2*(r - y)){
                d = d + 2*y - 1;
                y--;
            }
            else{
                d = d + 2*(y - x - 1);
                y--;
                x++;
            }
        }
        return step;
    }
    refPush(ref, obj){
        if (this.refs.hasOwnProperty(ref))
            obj[ref] = "";
        return obj;
    }
    render() {
        return (
            <table key="table">
                {this.getGrid()}
            </table>
        );
    }
}

class Square extends React.Component {
    constructor() {
        super();
        this.state = {
            color: "",
            originalColor: ""
        };
    }
    // Tell parent that this square was clicked
    handleClick(event) {
        this.props.parentHandleClick(event);
    }
    changeColor(color){
        this.setState({color: color});
        var mySquare = this;
        setTimeout(mySquare.setOriginalColor.bind(mySquare), 1000/fps);
    }
    setOriginalColor(){
        this.setState({color: ""});
    }
    componentDidMount() {
        this.setState({
            originalColor: this.props.bgColor
        });
    }
    render() {
        var style = Object.assign({}, this.props.style);
        if(this.state.color != "")
            style.backgroundColor = this.state.color;
        else
            style.backgroundColor = this.state.originalColor;
        return (
            <td onClick={this.handleClick.bind(this)}
                style={style}
                data-x={this.props.dataX}
                data-y={this.props.dataY}
            >
            </td>
        );
    }
}
Square.propTypes = {
    gotClick: React.PropTypes.func
};

ReactDOM.render(
    <Grid />,
    document.getElementById('container')
);