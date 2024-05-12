console.log(sessionStorage.getItem('token'));

export class AuthenticatedImageTool extends ImageTool {
    static get toolbox() {
        return ImageTool.toolbox;
    }

    constructor(...args) {
        super(...args);
    }

    async uploadByFile(file) {
        console.log(file);
        const formData = new FormData();
        formData.append('image', file);

        const additionalHeaders = this.config.additionalRequestHeaders || {};

        let response;

        try {
            response = await fetch('/uploadImage', {
                method: 'POST',
                headers: {
                    ...additionalHeaders
                },
                body: formData
            });
        } catch (error) {
            console.error(error);
            return;
        }
        console.log(response);
        const result = await response.json();
        console.log(result);
        return {
            success: result.success,
            file: {
                url: result.file.url
            }
        };
    }

    async downloadByUrl(url) {
        const additionalHeaders = this.config.additionalRequestHeaders || {};

        let response;

        try {
            response = await fetch(`/downloadImage?url=${encodeURIComponent(url)}`, {
                headers: {
                    ...additionalHeaders
                }
            });
        } catch (error) {
            console.error(error);
            return;
        }

        const result = await response.json();

        return {
            success: result.success,
            file: {
                url: result.file.url
            }
        };
    }
}