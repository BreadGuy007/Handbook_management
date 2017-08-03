/**
 * External dependencies
 */
import { throttle, debounce } from 'lodash';
import classnames from 'classnames';
import scrollIntoView from 'dom-scroll-into-view';

/**
 * WordPress dependencies
 */
import { __, sprintf, _n } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { keycodes } from '@wordpress/utils';
import { Spinner, withInstanceId } from '@wordpress/components';

const { UP, DOWN, ENTER } = keycodes;

class UrlInput extends Component {
	constructor() {
		super( ...arguments );
		this.onChange = this.onChange.bind( this );
		this.onKeyDown = this.onKeyDown.bind( this );
		this.bindListNode = this.bindListNode.bind( this );
		this.updateSuggestions = throttle( this.updateSuggestions.bind( this ), 200 );
		this.debouncedSpeakAssertive = debounce( this.speakAssertive.bind( this ), 500 );
		this.suggestionNodes = [];
		this.state = {
			posts: [],
			showSuggestions: false,
			selectedSuggestion: null,
		};
	}

	bindListNode( ref ) {
		this.listNode = ref;
	}

	bindSuggestionNode( index ) {
		return ( ref ) => {
			this.suggestionNodes[ index ] = ref;
		};
	}

	updateSuggestions( value ) {
		if ( this.suggestionsRequest ) {
			this.suggestionsRequest.abort();
		}

		// Show the suggestions after typing at least 3 characters
		if ( value.length < 2 ) {
			this.setState( {
				showSuggestions: false,
				selectedSuggestion: null,
				loading: false,
			} );

			return;
		}

		this.setState( {
			showSuggestions: true,
			selectedSuggestion: null,
			loading: true,
		} );
		this.suggestionsRequest = new wp.api.collections.Posts().fetch( { data: {
			search: value,
			per_page: 20,
			orderby: 'relevance',
		} } );

		this.suggestionsRequest
			.then(
				( posts ) => {
					this.setState( {
						posts,
						loading: false,
					} );

					if ( !! posts.length ) {
						this.debouncedSpeakAssertive( sprintf( _n(
							'%d result found, use up and down arrow keys to navigate.',
							'%d results found, use up and down arrow keys to navigate.',
							posts.length
						), posts.length ) );
					} else {
						this.debouncedSpeakAssertive( __( 'No results.' ) );
					}
				},
				( xhr ) => {
					if ( xhr.statusText === 'abort' ) {
						return;
					}
					this.setState( {
						loading: false,
					} );
				}
			);
	}

	onChange( event ) {
		const inputValue = event.target.value;
		this.props.onChange( inputValue );
		this.updateSuggestions( inputValue );
	}

	onKeyDown( event ) {
		const { selectedSuggestion, posts } = this.state;
		switch ( event.keyCode ) {
			case UP: {
				event.stopPropagation();
				event.preventDefault();
				const previousIndex = ! selectedSuggestion ? posts.length - 1 : selectedSuggestion - 1;
				this.setState( {
					selectedSuggestion: previousIndex,
				} );
				break;
			}
			case DOWN: {
				event.stopPropagation();
				event.preventDefault();
				const nextIndex = selectedSuggestion === null || ( selectedSuggestion === posts.length - 1 ) ? 0 : selectedSuggestion + 1;
				this.setState( {
					selectedSuggestion: nextIndex,
				} );
				break;
			}
			case ENTER: {
				if ( this.state.selectedSuggestion ) {
					event.stopPropagation();
					const post = this.state.posts[ this.state.selectedSuggestion ];
					this.props.onChange( post.link );
					this.setState( {
						showSuggestions: false,
					} );
				}
			}
		}
	}

	speakAssertive( message ) {
		wp.a11y.speak( message, 'assertive' );
	}

	componentWillUnmount() {
		if ( this.suggestionsRequest ) {
			this.suggestionsRequest.abort();
		}
		this.debouncedSpeakAssertive.cancel();
	}

	componentDidUpdate() {
		const { showSuggestions, selectedSuggestion } = this.state;
		// only have to worry about scrolling selected suggestion into view
		// when already expanded
		if ( showSuggestions && selectedSuggestion !== null && ! this.scrollingIntoView ) {
			this.scrollingIntoView = true;
			scrollIntoView( this.suggestionNodes[ selectedSuggestion ], this.listNode, {
				onlyScrollIfNeeded: true,
			} );

			setTimeout( () => {
				this.scrollingIntoView = false;
			}, 100 );
		}
	}

	render() {
		const { value, instanceId } = this.props;
		const { showSuggestions, posts, selectedSuggestion, loading } = this.state;
		/* eslint-disable jsx-a11y/no-autofocus */
		return (
			<div className="blocks-url-input">
				<input
					autoFocus
					type="url"
					aria-label={ __( 'URL' ) }
					required
					value={ value }
					onChange={ this.onChange }
					placeholder={ __( 'Paste URL or type' ) }
					onKeyDown={ this.onKeyDown }
					role="combobox"
					aria-expanded={ showSuggestions }
					aria-autocomplete="list"
					aria-owns={ `blocks-url-input-suggestions-${ instanceId }` }
					aria-activedescendant={ selectedSuggestion !== null ? `blocks-url-input-suggestion-${ instanceId }-${ selectedSuggestion }` : undefined }
				/>

				{ ( loading ) && <Spinner /> }

				{ showSuggestions && !! posts.length &&
					<div
						id={ `blocks-url-input-suggestions-${ instanceId }` }
						tabIndex="-1"
						className="blocks-url-input__suggestions"
						ref={ this.bindListNode }
						role="listbox"
					>
						{ posts.map( ( post, index ) => (
							<button
								key={ post.id }
								role="option"
								tabIndex="-1"
								id={ `blocks-url-input-suggestion-${ instanceId }-${ index }` }
								ref={ this.bindSuggestionNode( index ) }
								className={ classnames( 'blocks-url-input__suggestion', {
									'is-selected': index === selectedSuggestion,
								} ) }
								onClick={ () => this.props.onChange( post.link ) }
								aria-selected={ index === selectedSuggestion }
							>
								{ post.title.rendered }
							</button>
						) ) }
					</div>
				}
			</div>
		);
		/* eslint-enable jsx-a11y/no-autofocus */
	}
}

export default withInstanceId( UrlInput );
