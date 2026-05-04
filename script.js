const algorithms = {
            bubble: "Bubble Sort",
            selection: "Selection Sort",
            insertion: "Insertion Sort",
            quick: "Quick Sort",
            merge: "Merge Sort",
            heap: "Heap Sort",
            shell: "Shell Sort"
        };

        const descriptions = {
            bubble: "<strong>Bubble Sort:</strong> Repeatedly compares adjacent elements and swaps them if they are in the wrong order. Simple but inefficient: O(n²).",
            selection: "<strong>Selection Sort:</strong> Repeatedly selects the smallest element and moves it to the front. O(n²), but usually performs fewer swaps than Bubble Sort.",
            insertion: "<strong>Insertion Sort:</strong> Builds a sorted section one item at a time by inserting each value into its correct position. Strong for small or nearly sorted arrays.",
            quick: "<strong>Quick Sort:</strong> Picks a pivot, partitions values around it, then recursively sorts each side. Very fast on average: O(n log n).",
            merge: "<strong>Merge Sort:</strong> Splits the array into halves, sorts each half, then merges them back together. Stable and consistently O(n log n).",
            heap: "<strong>Heap Sort:</strong> Builds a max heap, then repeatedly moves the largest value to the sorted end of the array. Consistently O(n log n) and sorts in place.",
            shell: "<strong>Shell Sort:</strong> Improves Insertion Sort by comparing far-apart values first, then reducing the gap until the final pass is a normal insertion-style sort."
        };

        const complexities = {
            bubble: { best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)" },
            selection: { best: "O(n²)", avg: "O(n²)", worst: "O(n²)", space: "O(1)" },
            insertion: { best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)" },
            quick: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)", space: "O(log n)" },
            merge: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(n)" },
            heap: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(1)" },
            shell: { best: "O(n log n)", avg: "~O(n^1.3)", worst: "O(n²)", space: "O(1)" }
        };

        const barContainer = document.getElementById("bar-container");
        const singleTopControls = document.getElementById("singleTopControls");
        const comparisonTopControls = document.getElementById("comparisonTopControls");
        const randomizeBtn = document.getElementById("randomizeBtn");
        const compareRandomizeBtn = document.getElementById("compareRandomizeBtn");
        const sortBtn = document.getElementById("sortBtn");
        const pauseBtn = document.getElementById("pauseBtn");
        const resumeBtn = document.getElementById("resumeBtn");
        const stepBtn = document.getElementById("stepBtn");
        const resetBtn = document.getElementById("resetBtn");
        const copyShareBtn = document.getElementById("copyShareBtn");
        const downloadArrayBtn = document.getElementById("downloadArrayBtn");
        const algorithmSelect = document.getElementById("algorithmSelect");
        const sizeSlider = document.getElementById("sizeSlider");
        const minValueInput = document.getElementById("minValueInput");
        const maxValueInput = document.getElementById("maxValueInput");
        const arrayTypeSelect = document.getElementById("arrayTypeSelect");
        const speedSlider = document.getElementById("speedSlider");
        const soundToggle = document.getElementById("soundToggle");
        const themeToggle = document.getElementById("themeToggle");
        const sizeValue = document.getElementById("sizeValue");
        const speedValue = document.getElementById("speedValue");
        const statusText = document.getElementById("status");
        const comparisonCount = document.getElementById("comparisonCount");
        const swapCount = document.getElementById("swapCount");
        const elapsedTime = document.getElementById("elapsedTime");
        const descriptionPanel = document.getElementById("descriptionPanel");
        const complexityPanel = document.getElementById("complexityPanel");

        const leftCompareSelect = document.getElementById("leftCompareSelect");
        const rightCompareSelect = document.getElementById("rightCompareSelect");
        const compareSizeSlider = document.getElementById("compareSizeSlider");
        const compareSpeedSlider = document.getElementById("compareSpeedSlider");
        const compareSizeValue = document.getElementById("compareSizeValue");
        const compareSpeedValue = document.getElementById("compareSpeedValue");
        const compareBtn = document.getElementById("compareBtn");
        const toggleCompareBtn = document.getElementById("toggleCompareBtn");
        const comparisonSection = document.getElementById("comparisonSection");
        const singleView = document.getElementById("singleView");
        const leftCompareTitle = document.getElementById("leftCompareTitle");
        const rightCompareTitle = document.getElementById("rightCompareTitle");
        const leftCompareBars = document.getElementById("leftCompareBars");
        const rightCompareBars = document.getElementById("rightCompareBars");

        let values = [];
        let isSorting = false;
        let isPaused = false;
        let stepRequested = false;
        let comparisons = 0;
        let swaps = 0;
        let elapsedMs = 0;
        let timerInterval = null;
        let lastTimerTick = 0;
        let audioContext = null;
        let isComparisonView = false;

        function fillAlgorithmSelect(select, defaultValue) {
            select.innerHTML = "";
            Object.entries(algorithms).forEach(([value, label]) => {
                const option = document.createElement("option");
                option.value = value;
                option.textContent = label;
                select.appendChild(option);
            });
            select.value = defaultValue;
        }

        function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
        function getDelay() { return Number(speedSlider.value); }

        function updateDescription() {
            const algo = algorithmSelect.value;
            descriptionPanel.innerHTML = descriptions[algo] || "";
            const c = complexities[algo];
            complexityPanel.innerHTML = `
            <strong>Time Complexity:</strong><br>
            Best: ${c.best} &nbsp; | &nbsp; Avg: ${c.avg} &nbsp; | &nbsp; Worst: ${c.worst}<br>
            <strong>Space Complexity:</strong> ${c.space}
          `;
        }

        function resetStats() {
            comparisons = 0;
            swaps = 0;
            elapsedMs = 0;
            clearInterval(timerInterval);
            timerInterval = null;
            comparisonCount.textContent = "0";
            swapCount.textContent = "0";
            elapsedTime.textContent = "0.00s";
        }

        function updateStats() {
            comparisonCount.textContent = comparisons;
            swapCount.textContent = swaps;
            elapsedTime.textContent = `${(elapsedMs / 1000).toFixed(2)}s`;
        }

        function startTimer() {
            clearInterval(timerInterval);
            lastTimerTick = performance.now();
            timerInterval = setInterval(() => {
                const now = performance.now();
                if (!isPaused) {
                    elapsedMs += now - lastTimerTick;
                    updateStats();
                }
                lastTimerTick = now;
            }, 100);
        }

        function stopTimer() {
            clearInterval(timerInterval);
            timerInterval = null;
            updateStats();
        }

        function playSound(value, type = "compare") {
            if (!soundToggle.checked) return;
            if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
            if (audioContext.state === "suspended") audioContext.resume();

            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            oscillator.frequency.value = 150 + value * 2;
            oscillator.type = type === "swap" ? "square" : "sine";
            gain.gain.setValueAtTime(0.04, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
            oscillator.connect(gain);
            gain.connect(audioContext.destination);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.05);
        }

        function addComparison(soundValue = null) {
            comparisons++;
            if (soundValue !== null) playSound(soundValue, "compare");
            updateStats();
        }

        function addSwap(soundValue = null) {
            swaps++;
            if (soundValue !== null) playSound(soundValue, "swap");
            updateStats();
        }

        async function waitForNextAction() {
            while (isPaused && !stepRequested) await sleep(25);
            if (stepRequested) {
                stepRequested = false;
                isPaused = true;
                return;
            }

            let remainingDelay = getDelay();
            while (remainingDelay > 0) {
                if (isPaused) return waitForNextAction();
                const chunk = Math.min(25, remainingDelay);
                await sleep(chunk);
                remainingDelay -= chunk;
            }
        }

        function getSortedTail(sortedCount) {
            const sorted = [];
            for (let i = values.length - sortedCount; i < values.length; i++) if (i >= 0) sorted.push(i);
            return sorted;
        }

        function getRangeIndices(start, end, length = values.length) {
            const range = [];
            for (let i = start; i <= end; i++) if (i >= 0 && i < length) range.push(i);
            return range;
        }

        function renderBarsTo(container, array, states = {}) {
            const { compare = [], swap = [], sorted = [], pivot = [], current = [], range = [] } = states;
            container.innerHTML = "";
            array.forEach((value, index) => {
                const bar = document.createElement("div");
                bar.classList.add("bar");
                bar.style.height = `${value}px`;
                if (range.includes(index)) bar.classList.add("range");
                if (sorted.includes(index)) bar.classList.add("sorted");
                if (compare.includes(index)) bar.classList.add("compare");
                if (swap.includes(index)) bar.classList.add("swap");
                if (pivot.includes(index)) bar.classList.add("pivot");
                if (current.includes(index)) bar.classList.add("current");
                container.appendChild(bar);
            });
        }

        function renderBars(states = {}) { renderBarsTo(barContainer, values, states); }

        function clampValueSettings() {
            let minValue = Math.max(10, Math.min(390, Number(minValueInput.value)));
            let maxValue = Math.max(20, Math.min(410, Number(maxValueInput.value)));
            if (minValue >= maxValue) maxValue = minValue + 10;
            minValueInput.value = minValue;
            maxValueInput.value = maxValue;
            return { minValue, maxValue };
        }

        function getRandomValue(minValue, maxValue) {
            return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
        }

        function shuffleSomeValues(array, swapsToMake) {
            for (let i = 0; i < swapsToMake; i++) {
                const a = Math.floor(Math.random() * array.length);
                const b = Math.floor(Math.random() * array.length);
                [array[a], array[b]] = [array[b], array[a]];
            }
        }

        function buildArray() {
            const size = Number(sizeSlider.value);
            const { minValue, maxValue } = clampValueSettings();
            const arrayType = arrayTypeSelect.value;
            const array = [];

            if (arrayType === "random") {
                for (let i = 0; i < size; i++) array.push(getRandomValue(minValue, maxValue));
            } else if (arrayType === "nearlySorted") {
                for (let i = 0; i < size; i++) array.push(minValue + Math.round(((maxValue - minValue) / Math.max(1, size - 1)) * i));
                shuffleSomeValues(array, Math.max(1, Math.floor(size * 0.1)));
            } else if (arrayType === "reverse") {
                for (let i = 0; i < size; i++) array.push(maxValue - Math.round(((maxValue - minValue) / Math.max(1, size - 1)) * i));
            } else if (arrayType === "fewUnique") {
                const unique = [minValue, Math.round(minValue + (maxValue - minValue) * 0.25), Math.round(minValue + (maxValue - minValue) * 0.5), Math.round(minValue + (maxValue - minValue) * 0.75), maxValue];
                for (let i = 0; i < size; i++) array.push(unique[Math.floor(Math.random() * unique.length)]);
            }

            return array;
        }

        function generateArray() {
            values = buildArray();
            resetStats();
            renderBars();
            renderBarsTo(leftCompareBars, values);
            renderBarsTo(rightCompareBars, values);
            statusText.textContent = "Array generated.";
        }

        async function markAllSorted() {
            for (let i = 0; i < values.length; i++) {
                renderBars({ sorted: getRangeIndices(0, i) });
                playSound(values[i], "compare");
                await sleep(18);
            }
        }

        function setSortingState(sorting) {
            isSorting = sorting;
            randomizeBtn.disabled = sorting;
            compareRandomizeBtn.disabled = sorting;
            sortBtn.disabled = sorting;
            algorithmSelect.disabled = sorting;
            leftCompareSelect.disabled = sorting;
            rightCompareSelect.disabled = sorting;
            sizeSlider.disabled = sorting;
            compareSizeSlider.disabled = sorting;
            compareSpeedSlider.disabled = sorting;
            minValueInput.disabled = sorting;
            maxValueInput.disabled = sorting;
            arrayTypeSelect.disabled = sorting;
            compareBtn.disabled = sorting;
            copyShareBtn.disabled = sorting;
            downloadArrayBtn.disabled = sorting;
            resetBtn.disabled = sorting;
            pauseBtn.disabled = !sorting;
            resumeBtn.disabled = true;
            stepBtn.disabled = !sorting;
            if (!sorting) {
                isPaused = false;
                stepRequested = false;
            }
        }

        function pauseSort() {
            if (!isSorting) return;
            isPaused = true;
            stepRequested = false;
            pauseBtn.disabled = true;
            resumeBtn.disabled = false;
            stepBtn.disabled = false;
            statusText.textContent = "Sorting paused. Use Resume or Step.";
        }

        function resumeSort() {
            if (!isSorting) return;
            isPaused = false;
            stepRequested = false;
            pauseBtn.disabled = false;
            resumeBtn.disabled = true;
            stepBtn.disabled = false;
            statusText.textContent = `Running ${algorithms[algorithmSelect.value]}...`;
        }

        function stepSort() {
            if (!isSorting) return;
            stepRequested = true;
            isPaused = true;
            pauseBtn.disabled = true;
            resumeBtn.disabled = false;
            stepBtn.disabled = false;
            statusText.textContent = "Stepping through sort.";
        }

        async function bubbleSort() {
            for (let i = 0; i < values.length - 1; i++) {
                for (let j = 0; j < values.length - i - 1; j++) {
                    renderBars({ compare: [j, j + 1], sorted: getSortedTail(i) });
                    await waitForNextAction();
                    addComparison(values[j]);
                    if (values[j] > values[j + 1]) {
                        [values[j], values[j + 1]] = [values[j + 1], values[j]];
                        addSwap(values[j]);
                        renderBars({ swap: [j, j + 1], sorted: getSortedTail(i) });
                        await waitForNextAction();
                    }
                }
            }
        }

        async function selectionSort() {
            const sorted = [];
            for (let i = 0; i < values.length - 1; i++) {
                let minIndex = i;
                for (let j = i + 1; j < values.length; j++) {
                    renderBars({ compare: [minIndex, j], current: [i], sorted });
                    await waitForNextAction();
                    addComparison(values[j]);
                    if (values[j] < values[minIndex]) minIndex = j;
                }
                if (minIndex !== i) {
                    [values[i], values[minIndex]] = [values[minIndex], values[i]];
                    addSwap(values[i]);
                    renderBars({ swap: [i, minIndex], sorted });
                    await waitForNextAction();
                }
                sorted.push(i);
            }
        }

        async function insertionSort() {
            const sorted = [0];
            for (let i = 1; i < values.length; i++) {
                const currentValue = values[i];
                let j = i - 1;
                renderBars({ compare: [i, j], current: [i], sorted });
                await waitForNextAction();
                while (j >= 0) {
                    addComparison(values[j]);
                    if (values[j] <= currentValue) break;
                    values[j + 1] = values[j];
                    addSwap(values[j + 1]);
                    renderBars({ compare: [j, j + 1], swap: [j + 1], sorted });
                    await waitForNextAction();
                    j--;
                }
                values[j + 1] = currentValue;
                addSwap(currentValue);
                renderBars({ swap: [j + 1], sorted });
                await waitForNextAction();
                sorted.push(i);
            }
        }

        async function quickSort(start = 0, end = values.length - 1) {
            if (start >= end) return;
            const pivotIndex = await partition(start, end);
            await quickSort(start, pivotIndex - 1);
            await quickSort(pivotIndex + 1, end);
        }

        async function partition(start, end) {
            const pivotValue = values[end];
            let pivotIndex = start;
            for (let i = start; i < end; i++) {
                renderBars({ compare: [i], pivot: [end], current: [pivotIndex], range: getRangeIndices(start, end) });
                await waitForNextAction();
                addComparison(values[i]);
                if (values[i] < pivotValue) {
                    [values[i], values[pivotIndex]] = [values[pivotIndex], values[i]];
                    addSwap(values[pivotIndex]);
                    renderBars({ swap: [i, pivotIndex], pivot: [end], range: getRangeIndices(start, end) });
                    await waitForNextAction();
                    pivotIndex++;
                }
            }
            [values[pivotIndex], values[end]] = [values[end], values[pivotIndex]];
            addSwap(values[pivotIndex]);
            renderBars({ swap: [pivotIndex, end], pivot: [pivotIndex], range: getRangeIndices(start, end) });
            await waitForNextAction();
            return pivotIndex;
        }

        async function mergeSort(start = 0, end = values.length - 1) {
            if (start >= end) return;
            const middle = Math.floor((start + end) / 2);
            await mergeSort(start, middle);
            await mergeSort(middle + 1, end);
            await merge(start, middle, end);
        }

        async function merge(start, middle, end) {
            const left = values.slice(start, middle + 1);
            const right = values.slice(middle + 1, end + 1);
            let leftIndex = 0;
            let rightIndex = 0;
            let mainIndex = start;
            while (leftIndex < left.length && rightIndex < right.length) {
                renderBars({ compare: [start + leftIndex, middle + 1 + rightIndex], current: [mainIndex], range: getRangeIndices(start, end) });
                await waitForNextAction();
                addComparison(values[mainIndex]);
                if (left[leftIndex] <= right[rightIndex]) values[mainIndex++] = left[leftIndex++];
                else values[mainIndex++] = right[rightIndex++];
                addSwap(values[mainIndex - 1]);
                renderBars({ swap: [mainIndex - 1], current: [mainIndex - 1], range: getRangeIndices(start, end) });
                await waitForNextAction();
            }
            while (leftIndex < left.length) {
                values[mainIndex] = left[leftIndex++];
                addSwap(values[mainIndex]);
                renderBars({ swap: [mainIndex], current: [mainIndex], range: getRangeIndices(start, end) });
                await waitForNextAction();
                mainIndex++;
            }
            while (rightIndex < right.length) {
                values[mainIndex] = right[rightIndex++];
                addSwap(values[mainIndex]);
                renderBars({ swap: [mainIndex], current: [mainIndex], range: getRangeIndices(start, end) });
                await waitForNextAction();
                mainIndex++;
            }
        }

        async function heapSort() {
            const length = values.length;
            for (let i = Math.floor(length / 2) - 1; i >= 0; i--) await heapify(length, i);
            for (let end = length - 1; end > 0; end--) {
                [values[0], values[end]] = [values[end], values[0]];
                addSwap(values[end]);
                renderBars({ swap: [0, end], sorted: getSortedTail(length - 1 - end), range: getRangeIndices(0, end) });
                await waitForNextAction();
                await heapify(end, 0);
            }
        }

        async function heapify(heapSize, rootIndex) {
            let largest = rootIndex;
            const left = 2 * rootIndex + 1;
            const right = 2 * rootIndex + 2;
            const sorted = getSortedTail(values.length - heapSize);
            const range = getRangeIndices(0, heapSize - 1);
            if (left < heapSize) {
                renderBars({ compare: [largest, left], pivot: [largest], current: [left], sorted, range });
                await waitForNextAction();
                addComparison(values[left]);
                if (values[left] > values[largest]) largest = left;
            }
            if (right < heapSize) {
                renderBars({ compare: [largest, right], pivot: [largest], current: [right], sorted, range });
                await waitForNextAction();
                addComparison(values[right]);
                if (values[right] > values[largest]) largest = right;
            }
            if (largest !== rootIndex) {
                [values[rootIndex], values[largest]] = [values[largest], values[rootIndex]];
                addSwap(values[rootIndex]);
                renderBars({ swap: [rootIndex, largest], pivot: [largest], sorted, range });
                await waitForNextAction();
                await heapify(heapSize, largest);
            }
        }

        async function shellSort() {
            let gap = Math.floor(values.length / 2);
            while (gap > 0) {
                for (let i = gap; i < values.length; i++) {
                    const temp = values[i];
                    let j = i;
                    renderBars({ compare: [i, j - gap], current: [i], range: getRangeIndices(0, values.length - 1) });
                    await waitForNextAction();
                    while (j >= gap) {
                        addComparison(values[j - gap]);
                        if (values[j - gap] <= temp) break;
                        values[j] = values[j - gap];
                        addSwap(values[j]);
                        renderBars({ compare: [j, j - gap], swap: [j], current: [j], range: getRangeIndices(0, values.length - 1) });
                        await waitForNextAction();
                        j -= gap;
                    }
                    values[j] = temp;
                    addSwap(temp);
                    renderBars({ swap: [j], current: [j], range: getRangeIndices(0, values.length - 1) });
                    await waitForNextAction();
                }
                gap = Math.floor(gap / 2);
            }
        }

        async function startSort() {
            if (isSorting) return;
            resetStats();
            isPaused = false;
            stepRequested = false;
            setSortingState(true);
            startTimer();
            statusText.textContent = `Running ${algorithms[algorithmSelect.value]}...`;
            if (algorithmSelect.value === "bubble") await bubbleSort();
            else if (algorithmSelect.value === "selection") await selectionSort();
            else if (algorithmSelect.value === "insertion") await insertionSort();
            else if (algorithmSelect.value === "quick") await quickSort();
            else if (algorithmSelect.value === "merge") await mergeSort();
            else if (algorithmSelect.value === "heap") await heapSort();
            else if (algorithmSelect.value === "shell") await shellSort();
            await markAllSorted();
            stopTimer();
            setSortingState(false);
            statusText.textContent = "Sorting complete.";
        }

        function makeCompareContext(array, container, comparisonElement, swapElement, timeElement) {
            return {
                array,
                container,
                comparisons: 0,
                swaps: 0,
                elapsed: 0,
                lastTick: performance.now(),
                comparisonElement,
                swapElement,
                timeElement,
                update() {
                    this.comparisonElement.textContent = this.comparisons;
                    this.swapElement.textContent = this.swaps;
                    this.timeElement.textContent = `${(this.elapsed / 1000).toFixed(2)}s`;
                },
                tick() {
                    const now = performance.now();
                    this.elapsed += now - this.lastTick;
                    this.lastTick = now;
                    this.update();
                },
                render(states = {}) {
                    renderBarsTo(this.container, this.array, states);
                },
                compare(value) {
                    this.comparisons++;
                    this.update();
                },
                move() {
                    this.swaps++;
                    this.update();
                }
            };
        }

        async function compareDelay(ctx) {
            ctx.tick();
            await sleep(Math.max(5, Math.floor(getDelay() * 0.75)));
        }

        function ctxRange(ctx, start, end) {
            return getRangeIndices(start, end, ctx.array.length);
        }

        function ctxSortedTail(ctx, count) {
            const sorted = [];
            for (let i = ctx.array.length - count; i < ctx.array.length; i++) if (i >= 0) sorted.push(i);
            return sorted;
        }

        async function runCompareAlgorithm(type, ctx) {
            if (type === "bubble") await compareBubble(ctx);
            else if (type === "selection") await compareSelection(ctx);
            else if (type === "insertion") await compareInsertion(ctx);
            else if (type === "quick") await compareQuick(ctx, 0, ctx.array.length - 1);
            else if (type === "merge") await compareMergeSort(ctx, 0, ctx.array.length - 1);
            else if (type === "heap") await compareHeap(ctx);
            else if (type === "shell") await compareShell(ctx);
            ctx.render({ sorted: ctxRange(ctx, 0, ctx.array.length - 1) });
            ctx.tick();
        }

        async function compareBubble(ctx) {
            const a = ctx.array;
            for (let i = 0; i < a.length - 1; i++) {
                for (let j = 0; j < a.length - i - 1; j++) {
                    ctx.render({ compare: [j, j + 1], sorted: ctxSortedTail(ctx, i) });
                    await compareDelay(ctx);
                    ctx.compare();
                    if (a[j] > a[j + 1]) {
                        [a[j], a[j + 1]] = [a[j + 1], a[j]];
                        ctx.move();
                        ctx.render({ swap: [j, j + 1], sorted: ctxSortedTail(ctx, i) });
                        await compareDelay(ctx);
                    }
                }
            }
        }

        async function compareSelection(ctx) {
            const a = ctx.array;
            const sorted = [];
            for (let i = 0; i < a.length - 1; i++) {
                let min = i;
                for (let j = i + 1; j < a.length; j++) {
                    ctx.render({ compare: [min, j], current: [i], sorted });
                    await compareDelay(ctx);
                    ctx.compare();
                    if (a[j] < a[min]) min = j;
                }
                if (min !== i) {
                    [a[i], a[min]] = [a[min], a[i]];
                    ctx.move();
                    ctx.render({ swap: [i, min], sorted });
                    await compareDelay(ctx);
                }
                sorted.push(i);
            }
        }

        async function compareInsertion(ctx) {
            const a = ctx.array;
            const sorted = [0];
            for (let i = 1; i < a.length; i++) {
                const current = a[i];
                let j = i - 1;
                while (j >= 0) {
                    ctx.render({ compare: [j, j + 1], current: [i], sorted });
                    await compareDelay(ctx);
                    ctx.compare();
                    if (a[j] <= current) break;
                    a[j + 1] = a[j];
                    ctx.move();
                    ctx.render({ swap: [j + 1], sorted });
                    await compareDelay(ctx);
                    j--;
                }
                a[j + 1] = current;
                ctx.move();
                sorted.push(i);
            }
        }

        async function compareQuick(ctx, start, end) {
            if (start >= end) return;
            const pivot = await comparePartition(ctx, start, end);
            await compareQuick(ctx, start, pivot - 1);
            await compareQuick(ctx, pivot + 1, end);
        }

        async function comparePartition(ctx, start, end) {
            const a = ctx.array;
            const pivotValue = a[end];
            let pivotIndex = start;
            for (let i = start; i < end; i++) {
                ctx.render({ compare: [i], pivot: [end], current: [pivotIndex], range: ctxRange(ctx, start, end) });
                await compareDelay(ctx);
                ctx.compare();
                if (a[i] < pivotValue) {
                    [a[i], a[pivotIndex]] = [a[pivotIndex], a[i]];
                    ctx.move();
                    ctx.render({ swap: [i, pivotIndex], pivot: [end], range: ctxRange(ctx, start, end) });
                    await compareDelay(ctx);
                    pivotIndex++;
                }
            }
            [a[pivotIndex], a[end]] = [a[end], a[pivotIndex]];
            ctx.move();
            ctx.render({ swap: [pivotIndex, end], pivot: [pivotIndex], range: ctxRange(ctx, start, end) });
            await compareDelay(ctx);
            return pivotIndex;
        }

        async function compareMergeSort(ctx, start, end) {
            if (start >= end) return;
            const mid = Math.floor((start + end) / 2);
            await compareMergeSort(ctx, start, mid);
            await compareMergeSort(ctx, mid + 1, end);
            await compareMerge(ctx, start, mid, end);
        }

        async function compareMerge(ctx, start, mid, end) {
            const a = ctx.array;
            const left = a.slice(start, mid + 1);
            const right = a.slice(mid + 1, end + 1);
            let l = 0, r = 0, m = start;
            while (l < left.length && r < right.length) {
                ctx.render({ compare: [start + l, mid + 1 + r], current: [m], range: ctxRange(ctx, start, end) });
                await compareDelay(ctx);
                ctx.compare();
                a[m++] = left[l] <= right[r] ? left[l++] : right[r++];
                ctx.move();
            }
            while (l < left.length) { a[m++] = left[l++]; ctx.move(); ctx.render({ swap: [m - 1], range: ctxRange(ctx, start, end) }); await compareDelay(ctx); }
            while (r < right.length) { a[m++] = right[r++]; ctx.move(); ctx.render({ swap: [m - 1], range: ctxRange(ctx, start, end) }); await compareDelay(ctx); }
        }

        async function compareHeap(ctx) {
            const a = ctx.array;
            for (let i = Math.floor(a.length / 2) - 1; i >= 0; i--) await compareHeapify(ctx, a.length, i);
            for (let end = a.length - 1; end > 0; end--) {
                [a[0], a[end]] = [a[end], a[0]];
                ctx.move();
                ctx.render({ swap: [0, end], sorted: ctxSortedTail(ctx, a.length - 1 - end), range: ctxRange(ctx, 0, end) });
                await compareDelay(ctx);
                await compareHeapify(ctx, end, 0);
            }
        }

        async function compareHeapify(ctx, size, root) {
            const a = ctx.array;
            let largest = root;
            const left = 2 * root + 1;
            const right = 2 * root + 2;
            if (left < size) {
                ctx.render({ compare: [largest, left], range: ctxRange(ctx, 0, size - 1) });
                await compareDelay(ctx);
                ctx.compare();
                if (a[left] > a[largest]) largest = left;
            }
            if (right < size) {
                ctx.render({ compare: [largest, right], range: ctxRange(ctx, 0, size - 1) });
                await compareDelay(ctx);
                ctx.compare();
                if (a[right] > a[largest]) largest = right;
            }
            if (largest !== root) {
                [a[root], a[largest]] = [a[largest], a[root]];
                ctx.move();
                ctx.render({ swap: [root, largest], range: ctxRange(ctx, 0, size - 1) });
                await compareDelay(ctx);
                await compareHeapify(ctx, size, largest);
            }
        }

        async function compareShell(ctx) {
            const a = ctx.array;
            let gap = Math.floor(a.length / 2);
            while (gap > 0) {
                for (let i = gap; i < a.length; i++) {
                    const temp = a[i];
                    let j = i;
                    while (j >= gap) {
                        ctx.render({ compare: [j, j - gap], current: [j], range: ctxRange(ctx, 0, a.length - 1) });
                        await compareDelay(ctx);
                        ctx.compare();
                        if (a[j - gap] <= temp) break;
                        a[j] = a[j - gap];
                        ctx.move();
                        j -= gap;
                    }
                    a[j] = temp;
                    ctx.move();
                }
                gap = Math.floor(gap / 2);
            }
        }

        function syncSingleControlsToCompare() {
            compareSizeSlider.value = sizeSlider.value;
            compareSpeedSlider.value = speedSlider.value;
            compareSizeValue.textContent = sizeSlider.value;
            compareSpeedValue.textContent = `${speedSlider.value}ms`;
        }

        function syncCompareControlsToSingle() {
            sizeSlider.value = compareSizeSlider.value;
            speedSlider.value = compareSpeedSlider.value;
            sizeValue.textContent = compareSizeSlider.value;
            speedValue.textContent = `${compareSpeedSlider.value}ms`;
        }

        function showSingleView() {
            isComparisonView = false;
            singleTopControls.classList.remove("hidden");
            comparisonTopControls.classList.add("hidden");
            singleView.classList.remove("hidden");
            comparisonSection.classList.add("hidden");
            toggleCompareBtn.textContent = "Switch to Comparison View";
            renderBars();
        }

        function showComparisonView() {
            isComparisonView = true;
            syncSingleControlsToCompare();
            singleTopControls.classList.add("hidden");
            comparisonTopControls.classList.remove("hidden");
            singleView.classList.add("hidden");
            comparisonSection.classList.remove("hidden");
            toggleCompareBtn.textContent = "Switch to Single View";
            renderBarsTo(leftCompareBars, values);
            renderBarsTo(rightCompareBars, values);
        }


        function resetToDefaults() {
            if (isSorting) return;

            algorithmSelect.value = "bubble";
            leftCompareSelect.value = "bubble";
            rightCompareSelect.value = "quick";
            sizeSlider.value = "40";
            compareSizeSlider.value = "40";
            minValueInput.value = "20";
            maxValueInput.value = "410";
            arrayTypeSelect.value = "random";
            speedSlider.value = "60";
            compareSpeedSlider.value = "60";
            soundToggle.checked = false;
            themeToggle.checked = false;

            sizeValue.textContent = "40";
            compareSizeValue.textContent = "40";
            speedValue.textContent = "60ms";
            compareSpeedValue.textContent = "60ms";
            leftCompareTitle.textContent = algorithms[leftCompareSelect.value];
            rightCompareTitle.textContent = algorithms[rightCompareSelect.value];

            applyTheme();
            updateDescription();
            showSingleView();
            generateArray();
            statusText.textContent = "Defaults restored.";
        }

        function getSettingsForShare() {
            return {
                algorithm: algorithmSelect.value,
                left: leftCompareSelect.value,
                right: rightCompareSelect.value,
                size: sizeSlider.value,
                min: minValueInput.value,
                max: maxValueInput.value,
                type: arrayTypeSelect.value,
                speed: speedSlider.value,
                theme: themeToggle.checked ? "light" : "dark",
                view: isComparisonView ? "comparison" : "single",
                values: values.join(",")
            };
        }

        function applySettingsFromUrl() {
            const params = new URLSearchParams(window.location.search);
            if (!params.has("size")) return false;

            algorithmSelect.value = params.get("algorithm") || "bubble";
            leftCompareSelect.value = params.get("left") || "bubble";
            rightCompareSelect.value = params.get("right") || "quick";
            sizeSlider.value = params.get("size") || "40";
            minValueInput.value = params.get("min") || "20";
            maxValueInput.value = params.get("max") || "410";
            arrayTypeSelect.value = params.get("type") || "random";
            speedSlider.value = params.get("speed") || "60";
            themeToggle.checked = params.get("theme") === "light";
            applyTheme();

            sizeValue.textContent = sizeSlider.value;
            speedValue.textContent = `${speedSlider.value}ms`;
            leftCompareTitle.textContent = algorithms[leftCompareSelect.value];
            rightCompareTitle.textContent = algorithms[rightCompareSelect.value];
            updateDescription();

            const sharedValues = params.get("values");
            if (sharedValues) {
                values = sharedValues
                    .split(",")
                    .map(Number)
                    .filter(value => Number.isFinite(value));

                if (values.length > 0) {
                    sizeSlider.value = values.length;
                    sizeValue.textContent = values.length;
                    resetStats();
                    renderBars();
                    renderBarsTo(leftCompareBars, values);
                    renderBarsTo(rightCompareBars, values);
                    statusText.textContent = "Shared settings loaded.";
                    if (params.get("view") === "comparison") {
                        showComparisonView();
                    } else {
                        showSingleView();
                    }
                    return true;
                }
            }

            generateArray();
            statusText.textContent = "Shared settings loaded.";
            if (params.get("view") === "comparison") {
                showComparisonView();
            } else {
                showSingleView();
            }
            return true;
        }

        function applyTheme() {
            document.body.classList.toggle("light", themeToggle.checked);
        }

        async function copyShareLink() {
            const settings = getSettingsForShare();
            const params = new URLSearchParams(settings);
            const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

            try {
                await navigator.clipboard.writeText(shareUrl);
                statusText.textContent = "Share link copied to clipboard.";
            } catch (error) {
                statusText.textContent = "Could not copy automatically. Check your browser permissions.";
            }
        }

        function downloadArray() {
            const data = {
                createdAt: new Date().toISOString(),
                settings: getSettingsForShare(),
                values
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "sorting-array.json";
            link.click();
            URL.revokeObjectURL(url);
            statusText.textContent = "Array downloaded.";
        }

        async function startComparison() {
            if (isSorting) return;
            compareBtn.disabled = true;
            const startingArray = values.length ? [...values] : buildArray();
            const leftArray = [...startingArray];
            const rightArray = [...startingArray];

            leftCompareTitle.textContent = algorithms[leftCompareSelect.value];
            rightCompareTitle.textContent = algorithms[rightCompareSelect.value];

            const leftCtx = makeCompareContext(leftArray, leftCompareBars, document.getElementById("leftComparisons"), document.getElementById("leftSwaps"), document.getElementById("leftTime"));
            const rightCtx = makeCompareContext(rightArray, rightCompareBars, document.getElementById("rightComparisons"), document.getElementById("rightSwaps"), document.getElementById("rightTime"));

            leftCtx.update();
            rightCtx.update();
            leftCtx.render();
            rightCtx.render();

            await Promise.all([
                runCompareAlgorithm(leftCompareSelect.value, leftCtx),
                runCompareAlgorithm(rightCompareSelect.value, rightCtx)
            ]);

            compareBtn.disabled = false;
        }

        randomizeBtn.addEventListener("click", generateArray);
        compareRandomizeBtn.addEventListener("click", () => {
            syncCompareControlsToSingle();
            generateArray();
            syncSingleControlsToCompare();
        });
        sortBtn.addEventListener("click", startSort);
        pauseBtn.addEventListener("click", pauseSort);
        resumeBtn.addEventListener("click", resumeSort);
        stepBtn.addEventListener("click", stepSort);
        resetBtn.addEventListener("click", resetToDefaults);
        compareBtn.addEventListener("click", startComparison);
        toggleCompareBtn.addEventListener("click", () => {
            if (isComparisonView) {
                syncCompareControlsToSingle();
                showSingleView();
            } else {
                showComparisonView();
            }
        });
        copyShareBtn.addEventListener("click", copyShareLink);
        downloadArrayBtn.addEventListener("click", downloadArray);
        themeToggle.addEventListener("change", applyTheme);

        algorithmSelect.addEventListener("change", () => {
            updateDescription();
            if (!isSorting) {
                generateArray();
                statusText.textContent = `${algorithms[algorithmSelect.value]} selected. Array randomized.`;
            }
        });

        leftCompareSelect.addEventListener("change", () => leftCompareTitle.textContent = algorithms[leftCompareSelect.value]);
        rightCompareSelect.addEventListener("change", () => rightCompareTitle.textContent = algorithms[rightCompareSelect.value]);

        sizeSlider.addEventListener("input", () => {
            sizeValue.textContent = sizeSlider.value;
            compareSizeSlider.value = sizeSlider.value;
            compareSizeValue.textContent = sizeSlider.value;
            generateArray();
        });

        compareSizeSlider.addEventListener("input", () => {
            compareSizeValue.textContent = compareSizeSlider.value;
            syncCompareControlsToSingle();
            generateArray();
            syncSingleControlsToCompare();
        });

        minValueInput.addEventListener("change", generateArray);
        maxValueInput.addEventListener("change", generateArray);
        arrayTypeSelect.addEventListener("change", generateArray);
        speedSlider.addEventListener("input", () => {
            speedValue.textContent = `${speedSlider.value}ms`;
            compareSpeedSlider.value = speedSlider.value;
            compareSpeedValue.textContent = `${speedSlider.value}ms`;
        });

        compareSpeedSlider.addEventListener("input", () => {
            compareSpeedValue.textContent = `${compareSpeedSlider.value}ms`;
            syncCompareControlsToSingle();
        });

        fillAlgorithmSelect(algorithmSelect, "bubble");
        fillAlgorithmSelect(leftCompareSelect, "bubble");
        fillAlgorithmSelect(rightCompareSelect, "quick");
        syncSingleControlsToCompare();
        updateDescription();
        applyTheme();
        if (!applySettingsFromUrl()) {
            generateArray();
        }
