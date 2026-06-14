import Dropzone from '@deltablot/dropzone'
import '@deltablot/dropzone/dist/dropzone.css'
import './style.css'
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faCircleDown } from '@fortawesome/free-regular-svg-icons'
import saveAs from 'file-saver'

function removeMapExtension(filename) {
    return filename.replace(/\.km[lz]$/i, '')
}

const dropzone = new Dropzone('.dropzone', {
    url: '/',
    maxFiles: 1,
    acceptedFiles: 'application/vnd.google-earth.kml+xml, application/vnd.google-earth.kmz, .kml, .kmz',
    init: function () {
        this.on('success', (file, response) => {
            this.removeAllFiles()
            const blob = new Blob([response], { type: 'application/vnd.google-earth.kml+xml' })
            saveAs(blob, `${removeMapExtension(file.name)}.converted.kml`)
            const errorBlock = document.getElementById('error-block')
            errorBlock.style.display = 'none'
        })
        this.on('error', (file, message) => {
            this.removeAllFiles()
            const errorMessageContainer = document.getElementById('error-message')
            let stringMessage =
                typeof message === 'string' ? message : message.error || 'An error occurred during the upload'
            if (stringMessage.endsWith('.')) {
                stringMessage = stringMessage.slice(0, -1)
            }
            errorMessageContainer.textContent = stringMessage
            const errorBlock = document.getElementById('error-block')
            errorBlock.style.display = 'block'
        })
        this.on('addedfile', (file) => {
            if (this.files.length > 1) {
                this.removeFile(this.files[0])
            }
        })
    },
})

library.add(faCircleDown)
dom.watch()
