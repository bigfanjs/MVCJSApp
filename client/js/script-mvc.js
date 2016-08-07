const
  assign = Object.assign,
  create = Object.create,
  mainEl = '.blogs-list';

var ID = 0;

// The Model:
const Model = {
  author: '',
  title: '',
  url: '',
  setup( options = {} ) {
    var obj = assign(
      create( this ),
      options
    );

    obj.id = ++ID;
    obj.views = [];

    const set = function ( target, key, val, context ) {
      Reflect.set( ...arguments );

      target.views.forEach(view => {
        view.render( context );
      });

      return true;
    };

    const
      handler = { set },
      proxy = new Proxy( obj, handler );

    return proxy;
  },
  save( res, rej ) {
    var method = 'POST',
      endpoint = '',
      id;

    if ( ( id = this._id ) != undefined ) {
      method = 'PUT';
    }

    jQuery.ajax({
      type: method,
      url: `http://localhost:8080/api/blogs/${ id ? id : '' }`,
      data: JSON.stringify( this ),
      dataType: 'json',
      contentType: 'application/json',
      success: res,
      error: rej
    });

    return this;
  },
  fetch() {
    var url = `http://localhost:8080/api/blogs/${ this._id }`,
      obj;

    jQuery.get(url, res => {
      $.each(res, ( idx, obj ) => {
        Object.assing( this, obj );
      });
      obj = res;
    });

    return obj;
  },
  destroy( res, rej ) {
    jQuery.ajax({
      type: 'DELETE',
      url: `http://localhost:8080/api/blogs/${ this._id }`,
      dataType: 'json',
      success: res,
      error: rej
    });
  }
};

// The View:
const View = {
  tag: 'tr',
  template: '.blog-list-template',
  setup( options ) {
    var _this = assign(
      create( this ),
      options
    ), elem;

    elem = _this.elem = $(`<${ this.tag }>`);

    if ( _this.className )
      elem.attr('class', _this.className);
    if ( _this.ID )
      elem.attr('id', _this.ID);

    return _this;
  },
  render( model ) {
    var
      compiler = _.template( $( this.template ).html() ),
      html = compiler( model ),
      elem = this.elem;

    elem.html( html );

    this.registerEvents( model );

    elem.find('.update-blog').hide();
    elem.find('.cancel').hide();

    return this;
  },
  registerEvents( model ) {
    var eventHandler = Controller.handle,
      el = this.elem;

    for ( let i = 0,
        methods = [ 'edit', 'update', 'delete', 'cancel' ];
          i < methods.length; i++ ) {
      el.find('.' + methods[ i ] +
        ( i >= methods.length - 1 ? '' : '-blog' )).click(
          eventHandler.bind( Controller, model )
        );
    }
  },
  remove() {
    this.elem.remove();
  },
  subscribe( model ) {
    model.views.push( this );

    let el = this.render( model ).elem;
    $( mainEl ).append( el );

    return this;
  },
  unsubscribe( model ) {
    var views = model.views,
      index = views.indexOf( this );

    views.splice( index, 1 );
  }
};

// The Controller:
const Controller = {
  edit( model, target ) {
    var arr = [ 'author', 'title', 'url' ],
      elem = target.parents('tr'),
      tds = elem.find('td');

    tds.each(function ( idx, td ) {
      if ( idx >= tds.length - 1 ) return;
      $( td ).html(
        `<input
          class="form-control ${ arr[ idx ] }-input"
          value=${ model[ arr[ idx ] ] }
        >`
      );
    });

    elem.find('.delete-blog').hide();
    elem.find('.edit-blog').hide();

    elem.find('.update-blog').show();
    elem.find('.cancel').show();
  },
  delete( model ) {
    model.views.forEach(view => {
      view.unsubscribe( model );
      view.remove();
    });
    model.destroy(
      () => { console.log('Correctly deleted!'); },
      () => { console.log('something bad happend!'); }
    );
  },
  update( model, target ) {
    var elem = target.parents('tr');

    var author = elem.find('.author-input').val(),
      title = elem.find('.title-input').val(),
      url = elem.find('.url-input').val();

    model.author = author;
    model.title = title;
    model.url = url;

    model.save(
      () => { console.log('correctly updated!'); },
      () => { console.log('something bad happend!'); }
    );
  },
  cancel( model, target ) {
    var elem = target.parents('tr')[ 0 ];

    for ( let i = 0; i < model.views.length; i++ ) {
      let view = model.views[ i ];

      if ( view.elem[ 0 ] == elem ) {
        view.render( model );
        break;
      }
    }
  },
  handle( model, event ) {
    var elem = $( event.target ),
      className = elem.attr('class').split(' ')[ 2 ];

    switch( className ) {
      case 'edit-blog':
        this.edit( model, elem );
        break;
      case 'delete-blog':
        this.delete( model, elem );
        break;
      case 'update-blog':
        this.update( model, elem );
        break;
      case 'cancel':
        this.cancel( model, elem );
        break;
    }
  }
};

$( document ).ready(() => {
  jQuery.get('http://localhost:8080/api/blogs', res => {
    res.forEach(obj => {
      let
        model = Model.setup( obj ),
        view = View.setup().subscribe( model );
    });
  });

  $('.add-blog').click(e => {
    let
      author_input = $('.author-input'),
      title_input = $('.title-input'),
      url_input = $('.url-input');

    let model = Model.setup({
      author: author_input.val(),
      title: title_input.val(),
      url: url_input.val()
    }).save(
      () => { console.log('Correctelly saved model'); },
      () => { console.log('Something bad happend at saving!'); }
    );

    let list_view = View.setup().subscribe( model );

    author_input.val('');
    title_input.val('');
    url_input.val('');
  });
});