class DrawingBoard {
    canvas; ctx; canvasStatesList;
    currentCanvasStateIdx;
    lastX; lastY; isDrawing;
    projectName;

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.canvasStatesList = [];
        this.currentCanvasStateIdx = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.isDrawing = false;
        this.projectName = "default";
        this.maxStatesLimit = 10;
        this.init();
        this.saveAction();
    }

    stopDrawing() {
        this.isDrawing = false;
        this.saveAction();
    }

    startDrawing(e) {
        this.isDrawing = true;
        [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
    }
    
    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx.lineJoin = "round";
        this.ctx.lineCap = "round";

        this.canvas.addEventListener("mousemove", this.drawLine.bind(this));
        this.canvas.addEventListener("mousedown", this.startDrawing.bind(this));
    
        this.canvas.addEventListener("mouseup", this.stopDrawing.bind(this));
        this.canvas.addEventListener("mouseout", this.stopDrawing.bind(this));
    
        this.canvas.addEventListener("dragenter", this.ignoreMouseEvent);
        this.canvas.addEventListener("dragover", this.ignoreMouseEvent);
        this.canvas.addEventListener("drop", this.handleImageDrop.bind(this));
    }

    setLineWidth(value) {
        this.ctx.lineWidth = value;
    }

    setStrokeColor(value) {
        this.ctx.strokeStyle = value;
    }

    clear(save = true) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if(!save) return;
        this.saveAction();
    }

    drawLine(e) {
        if (!this.isDrawing) return;
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(e.offsetX, e.offsetY);
        this.ctx.stroke();
        [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
    }

    ignoreMouseEvent(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    drawImage(source, x, y, width, height) {
        const image = new Image();
        image.onload = () => {
            width = width ? width : image.naturalWidth;
            height = height ? height : image.naturalHeight;
            this.ctx.drawImage(image, x, y, width, height);
        }
        image.src = source;
    }

    raiseErrorEvent(message) {
        console.error(message);
        this.canvas.dispatchEvent(
            new ErrorEvent("error", {
                message : message
            })
        );
    }

    handleImageDrop(e) {
        this.ignoreMouseEvent(e);
        const currentX = e.offsetX;
        const currentY = e.offsetY;

        const dt = e.dataTransfer;
        const files = dt.files;
        const file = files[0];

        if(!file.type.startsWith("image/")) {
            const message = "Error: Unsupported file format (not an image)."
            this.raiseErrorEvent(message);
            return;
        }

        const reader = new FileReader();
        reader.onerror = (error) => {
            const message = `Error while reading file: ${error.message}`;
            this.raiseErrorEvent(message);
        };
        reader.onload = (e) => {
            this.drawImage(e.target.result, currentX, currentY);
            this.saveAction();
        };
        reader.readAsDataURL(file);
    }

    setProjectName(name) {
        this.projectName = name;
    }

    download() {
        const dataURL = this.canvas.toDataURL();
        const link = document.createElement("a");
        link.download = `${this.projectName}.png`;
        link.href = dataURL;
        link.click();
    }

    saveProject() {
        const project = {
            "name": this.projectName,
            "data": this.canvas.toDataURL()
        };

        const blob = new Blob([JSON.stringify(project, null, 2)], {
            type: "application/json",
        });
        const projectURL = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `${this.projectName}.json`;
        link.href = projectURL;
        link.click();
        URL.revokeObjectURL(projectURL);
    }

    openProject(file) {
        if(!file || !file.type.startsWith("application/json")) {
            const message = "Error: not a JSON file";
            this.raiseErrorEvent(message);
            return;
        }
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onerror = (error) => {
            const message = `Error while reading file: ${error.message}`;
            this.raiseErrorEvent(message);
        };
        reader.onload = readerEvent => {
            var content = readerEvent.target.result;
            const projectData = JSON.parse(content);
            this.drawImage(projectData.data, 0, 0, this.canvas.width, this.canvas.height);
            this.setProjectName(projectData.name);
        }
    }

    renderState(index) {
        this.clear(false);
        const state = this.canvasStatesList[index];
        this.drawImage(state, 0, 0, this.canvas.width, this.canvas.height);
    }

    undoAction() {
        this.currentCanvasStateIdx = this.currentCanvasStateIdx > 0 ? 
        --this.currentCanvasStateIdx : 0;
        this.renderState(this.currentCanvasStateIdx);
    }

    redoAction() {
        if (this.currentCanvasStateIdx == this.canvasStatesList.length - 1) return;
        this.currentCanvasStateIdx++;
        this.renderState(this.currentCanvasStateIdx);
    }

    saveAction() {
        while(this.canvasStatesList.length > this.maxStatesLimit) {
            const state = this.canvasStatesList.shift();
            URL.revokeObjectURL(state);
        }

        this.canvas.toBlob((blob) => {
            const currentState = URL.createObjectURL(blob);
            this.canvasStatesList.push(currentState);
            this.currentCanvasStateIdx = this.canvasStatesList.length - 1;
        });
    }
}