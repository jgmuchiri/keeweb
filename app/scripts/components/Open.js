import React from 'react';
import PropTypes from 'prop-types';
import { Res } from 'containers/util/Res';
import { OpenButton } from 'components/OpenButton';

class Open extends React.Component {
    propTypes = {
        locale: PropTypes.object.isRequired,
        lastFiles: PropTypes.array.isRequired,
        file: PropTypes.object.isRequired,
        keyFile: PropTypes.object.isRequired,
        rows: PropTypes.object.isRequired,
        secondRowVisible: PropTypes.bool,
        canOpen: PropTypes.bool,
        canOpenKeyFromDropbox: PropTypes.bool,
        canRemoveLatest: PropTypes.bool,
        onClick: PropTypes.func.isRequired,
        onFileSelect: PropTypes.func.isRequired,
        onFileClick: PropTypes.func.isRequired,
        onFileDeleteClick: PropTypes.func.isRequired,
        onDropboxKeyFileClick: PropTypes.func.isRequired,
        onKeyFileDeselect: PropTypes.func.isRequired,
    };
    onButtonClick = e => {
        const id = e.target.closest('[data-id]').dataset.id;
        switch (id) {
            case 'open':
            case 'import-xml':
                this.fileInput.button = id;
                this.fileInput.click();
                return;
            default:
                this.props.onClick({ button: id });
        }
    };
    onFileClick = e => {
        const id = e.target.closest('[data-id]').dataset.id;
        this.props.onFileClick({ id });
    };
    onFileDeleteClick = e => {
        e.stopPropagation();
        const id = e.target.closest('[data-id]').dataset.id;
        this.props.onFileDeleteClick({ id });
    };
    onPasswordInputClick = () => {
        if (!this.props.file) {
            this.fileInput.button = 'open';
            this.fileInput.click();
        }
    };
    onPasswordInputKeyDown = e => {
        const ch = e.key;
        const lower = ch.toLowerCase();
        const upper = ch.toUpperCase();
        if (ch.length === 1 && lower !== upper && !e.shiftKey) {
            const isCapsLockOn = ch !== lower;
            if (isCapsLockOn !== this.state.isCapsLockOn) {
                this.setState({ isCapsLockOn });
            }
        }
    };
    onPasswordInputKeyUp = e => {
        if (e.key === 'CapsLock') {
            this.setState({ isCapsLockOn: false });
        }
    };
    onFileInputChange = e => {
        const file = e.target.files[0];
        const button = this.fileInput.button;
        this.fileInput.value = null;
        this.props.onFileSelect({ button, file });
    };
    onKeyFileClick = () => {
        if (this.props.keyFile) {
            this.props.onKeyFileDeselect();
        } else {
            this.fileInput.button = 'keyfile';
            this.fileInput.click();
        }
    };
    onDropboxKeyFileClick = e => {
        e.stopPropagation();
        this.props.onDropboxKeyFileClick();
    };
    componentDidUpdate() {
        if (this.props.file && this.passwordInput) {
            this.passwordInput.focus();
        }
    }
    render() {
        const {
            locale,
            lastFiles,
            rows,
            file,
            keyFile,
            canOpen,
            canRemoveLatest,
            canOpenKeyFromDropbox,
            secondRowVisible,
        } = this.props;
        const { isCapsLockOn } = this.state;
        let passwordInputPlaceholder = '';
        if (file) {
            passwordInputPlaceholder = `${locale.openPassFor} ${file.name}`;
        } else if (canOpen) {
            passwordInputPlaceholder = locale.openClickToOpen;
        }
        let ix = 0;
        return (
            <div className={`open ${file ? 'open--file' : ''}`}>
                <input
                    type="file"
                    className="open__file-ctrl hide-by-pos"
                    ref={node => (this.fileInput = node)}
                    onChange={this.onFileInputChange}
                />
                <div className="open__icons">
                    {rows.first.map(btn => (
                        <OpenButton
                            key={btn.id}
                            button={btn}
                            tabIndex={++ix}
                            onClick={this.onButtonClick}
                        />
                    ))}
                </div>
                {!!secondRowVisible && (
                    <div className="open__icons open__icons--lower">
                        {rows.second.map(btn => (
                            <OpenButton
                                key={btn.id}
                                button={btn}
                                tabIndex={++ix}
                                onClick={this.onButtonClick}
                            />
                        ))}
                    </div>
                )}
                <div className="open__pass-area">
                    <div className="hide">
                        {/* we need these inputs to screw browsers passwords autocompletion */}
                        <input type="text" style="display:none" name="username" />
                        <input type="password" style="display:none" name="password" />
                    </div>
                    <div className="open__pass-warn-wrap">
                        <div
                            className={`open__pass-warning muted-color ${
                                isCapsLockOn ? '' : 'invisible'
                            }`}
                        >
                            <i className="fa fa-exclamation-triangle" /> <Res id="openCaps" />
                        </div>
                    </div>
                    <div className="open__pass-field-wrap">
                        <input
                            className={`open__pass-input`}
                            name="password"
                            type="password"
                            size="30"
                            autoComplete="new-password"
                            autoFocus={!!file}
                            maxLength="1024"
                            placeholder={passwordInputPlaceholder}
                            onClick={file ? undefined : this.onPasswordInputClick}
                            onKeyDown={this.onPasswordInputKeyDown}
                            onKeyUp={this.onPasswordInputKeyUp}
                            readOnly={!file}
                            tabIndex={++ix}
                            ref={node => (this.passwordInput = node)}
                        />
                        <div className="open__pass-enter-btn" tabIndex={++ix}>
                            <i className="fa fa-level-down fa-rotate-90" />
                        </div>
                        <div className="open__pass-opening-icon">
                            <i className="fa fa-spinner fa-spin" />
                        </div>
                    </div>
                    {!!file && (
                        <div className="open__settings">
                            <div
                                className="open__settings-key-file"
                                tabIndex={++ix}
                                onClick={this.onKeyFileClick}
                            >
                                <i className="fa fa-key open__settings-key-file-icon" />
                                <span className="open__settings-key-file-name">
                                    {' '}
                                    {keyFile ? keyFile.name : <Res id="openKeyFile" />}
                                </span>
                                {!!canOpenKeyFromDropbox && (
                                    <span
                                        className="open__settings-key-file-dropbox"
                                        onClick={this.onDropboxKeyFileClick}
                                    >
                                        {' '}
                                        <Res id="openKeyFileDropbox" />
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                    <div className="open__last">
                        {lastFiles.map(file => (
                            <div
                                className="open__last-item"
                                key={file.id}
                                data-id={file.id}
                                title={file.displayedPath}
                                tabIndex={++ix}
                                onClick={this.onFileClick}
                            >
                                {!!file.icon && (
                                    <i className={`fa fa-${file.icon} open__last-item-icon`} />
                                )}
                                {!!file.iconSvg && (
                                    <div className="open__last-item-icon open__last-item-icon--svg">
                                        <file.iconSvg />
                                    </div>
                                )}
                                <span className="open__last-item-text">{file.name}</span>
                                {!!canRemoveLatest && (
                                    <i
                                        className="fa fa-times open__last-item-icon-del"
                                        onClick={this.onFileDeleteClick}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}

export { Open };
