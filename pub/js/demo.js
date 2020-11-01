define(["require", "exports", "./index"], function (require, exports, index_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // find the empty iframe in the page
    const iframe = document.querySelector('#iframe');
    const output = document.querySelector('#output');
    // load some content in the iframe
    iframe.src = '../demo-template/';
    iframe.onload = () => {
        // create the Stage class
        window['stage'] = new index_1.Stage(iframe, iframe.contentDocument.querySelectorAll('.stage-element'), {
            onDrop: (selectables) => {
                const dropElement = selectables[0].dropZone.parent;
                const str = `${selectables.length} elements have been droped to ${dropElement.tagName.toLocaleLowerCase()}${dropElement.id ? '#' + dropElement.id : ''}${Array.from(dropElement.classList).map(c => '.' + c).join('')}`;
                // console.log(str);
                output.value = str;
            },
            onDrag: (selectables, boundingBox) => {
                const str = `${selectables.length} elements are being draged`;
                // console.log(str);
                output.value = str;
            },
            onResize: (selectables, boundingBox) => {
                const str = `${selectables.length} elements have been resizeed to ${JSON.stringify(boundingBox)}`;
                // console.log(str);
                output.value = str;
            },
            onDraw: (selectables, boundingBox) => {
                const str = `Drawing region: ${JSON.stringify(boundingBox)}`;
                // console.log(str);
                output.value = str;
            },
            onSelect: (selectables) => {
                const str = `${selectables.length} elements have been (un)selected`;
                // console.log(str);
                output.value = str;
            },
        });
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVtby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90cy9kZW1vLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUVBLG9DQUFvQztJQUNwQyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBc0IsQ0FBQztJQUN0RSxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBcUIsQ0FBQztJQUNyRSxrQ0FBa0M7SUFDbEMsTUFBTSxDQUFDLEdBQUcsR0FBRyxtQkFBbUIsQ0FBQTtJQUNoQyxNQUFNLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRTtRQUNuQix5QkFBeUI7UUFDekIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksYUFBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsZUFBZSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLEVBQUU7WUFDN0YsTUFBTSxFQUFFLENBQUMsV0FBVyxFQUFFLEVBQUU7Z0JBQ3RCLE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2dCQUNuRCxNQUFNLEdBQUcsR0FBRyxHQUFJLFdBQVcsQ0FBQyxNQUFPLGlDQUFrQyxXQUFXLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFHLEdBQUksV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUcsR0FBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBRSxFQUFFLENBQUM7Z0JBQ2hPLG9CQUFvQjtnQkFDcEIsTUFBTSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7WUFDckIsQ0FBQztZQUNELE1BQU0sRUFBRSxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsRUFBRTtnQkFDbkMsTUFBTSxHQUFHLEdBQUcsR0FBSSxXQUFXLENBQUMsTUFBTyw0QkFBNEIsQ0FBQztnQkFDaEUsb0JBQW9CO2dCQUNwQixNQUFNLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztZQUNyQixDQUFDO1lBQ0QsUUFBUSxFQUFFLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxFQUFFO2dCQUNyQyxNQUFNLEdBQUcsR0FBRyxHQUFJLFdBQVcsQ0FBQyxNQUFPLG1DQUFtQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3BHLG9CQUFvQjtnQkFDcEIsTUFBTSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7WUFDckIsQ0FBQztZQUNELE1BQU0sRUFBRSxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsRUFBRTtnQkFDbkMsTUFBTSxHQUFHLEdBQUcsbUJBQW1CLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQztnQkFDN0Qsb0JBQW9CO2dCQUNwQixNQUFNLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztZQUNyQixDQUFDO1lBQ0QsUUFBUSxFQUFFLENBQUMsV0FBVyxFQUFFLEVBQUU7Z0JBQ3hCLE1BQU0sR0FBRyxHQUFHLEdBQUksV0FBVyxDQUFDLE1BQU8sa0NBQWtDLENBQUM7Z0JBQ3RFLG9CQUFvQjtnQkFDcEIsTUFBTSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7WUFDckIsQ0FBQztTQUNGLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyJ9