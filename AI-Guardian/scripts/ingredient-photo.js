
        //photo scanning 
        async function handleUpload(event, mode) {
            const inputElement = event.target;
            if (!inputElement.files?.length) {
                alert('Please choose a file');
                return;
            }

            try {
                //compress photos
                const file = inputElement.files[0];
                const compressedBlob = await new Promise(resolve => {
                compressImage(file, resolve);
                });

                //OCR Space scanning photos
                const extractedText = await runOCR(compressedBlob);

                //I didn't change this code after I deleted the initial receipt upload button, for some reason. Just keep it. 
                if (mode === 'allergyCheck') {
                await checkAllergens(extractedText);
                } else if (mode === 'productMatch') {
                await matchProducts(extractedText);
                }
            } catch (error) {
                console.error("failed:", error);
                alert(`failed: ${error.message}`);
            }
        }

        //following code is to compress photo, because OCR Space only provides 1mb limit in free version
        function compressImage(file, callback) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (blob.size > 1024 * 1024) {
                                canvas.toBlob(
                                    (blob) => callback(blob),
                                    'image/webp',
                                    0.7
                                );
                            } else {
                                callback(blob);
                            }
                        },
                        'image/webp',
                        0.8
                    );
                };
            };
        }


        //OCR scanning 
        async function runOCR(compressedBlob) {
            const formData = new FormData();
            formData.append('file', compressedBlob, 'image.webp');
            formData.append('language', 'eng');
            formData.append('OCREngine', '2');
            formData.append('isOverlayRequired', 'false');

            //for unknown reason, sometimes apiKey suddenly doesn't work, so I just register a new one. There are other OCR api but I don't want to put my payment into it
            const apiKey = 'K84788786688957';
            const apiUrl = `https://api.ocr.space/parse/image`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'apikey': apiKey },
                body: formData,
            });
            const result = await response.json();

            if (result.IsErroredOnProcessing) {
                throw new Error(result.ErrorMessage);
            }

            //this is the extracted text
            return result.ParsedResults[0].ParsedText; 
        }



        //after we get text from product photo, we can find if it contains allergens. If it does, we give an alarm.
        async function checkAllergens(extractedText) {
            const warningElement = document.getElementById('warning');
            
            //I assume the first line of the extract text is the product name. It usually is. 
            //const foodName = extractedText.split("\n")[0];
            document.getElementById('extractedText').textContent = extractedText;
            //document.getElementById('result').classList.remove('hidden');

            //if product text contains allergen, we give alarm.
            //notice: I just hard code 'milk' here. It should be changed to user's allergen preference list.
            if (extractedText.toLowerCase().includes('milk')) {
                warningElement.textContent = "Warning! This product contains your allergens: milk";
                warningElement.style.display = 'block';
            } else {
                warningElement.style.display = 'none';
            }
        }