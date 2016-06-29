import React from "react";
import ReactDOM from "react-dom";

const gridHeight = 20;
const gridWidth = 20;
const initialColors = [
    "red",
    "purple",
    "orange",
    "blue",
    "green",
    "black",
    "brown",
    "pink"
];
const rippleR = 5;
const fps = 20;

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
            var step = {};
            var xmin = x - s ;
            var xmax = x + s;
            var ymin = y - s ;
            var ymax = y + s ;

            for (var i = xmin; i <= xmax; i++) {
                if (this.refs.hasOwnProperty(i + "_" + ymin))
                    step[i + "_" + ymin] = "";
                if (this.refs.hasOwnProperty(i + "_" + ymax))
                    step[i + "_" + ymax]="";
            }
            for (i = ymin+1; i < ymax; i++) {
                if (this.refs.hasOwnProperty(xmin + "_" + i))
                    step[xmin + "_" + i]="";
                if (this.refs.hasOwnProperty(xmax + "_" + i))
                    step[xmax + "_" + i]="";
            }
            allRefs.push(step);
        }
        return allRefs;
    }
    ripple(){
        //set new color for ref
        var curstep = this.state.refs[this.state.step];
        console.log(curstep);
        for (var ref in curstep) {
            if (curstep.hasOwnProperty(ref)) {
                this.refs[ref].changeColor(this.state.color);
            }
        }

        // loop to animate
        if (this.state.step < rippleR) {
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
    getGrid() {
        var rows = [],
            color;
        for (var i=0; i < gridHeight; i++) {
            var cells = [];
            for (var j=0; j < gridWidth; j++) {
                if(this.state.color != "")
                    color = this.state.color;
                else
                    color = initialColors[(j+i)%8];
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