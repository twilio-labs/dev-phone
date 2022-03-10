import styles from './DtmfButton.module.css'

function DTMFButton({tone, disabled, onClick}) {
    return (<button 
                key={tone}
                className={styles.button}
                disabled={disabled}
                onClick={onClick}>{tone}</button>
        )
}

export default DTMFButton