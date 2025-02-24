var _Raven = require('../../src/raven');
var vuePlugin = require('../../plugins/vue');

var Raven;
describe('Vue plugin', function() {
  beforeEach(function() {
    Raven = new _Raven();
    Raven.config('http://abc@example.com:80/2');
  });

  describe('errorHandler', function() {
    beforeEach(function() {
      this.sinon.stub(Raven, 'captureException');
      this.MockVue = {
        config: {}
      };
    });

    it('should capture component name and propsData', function() {
      vuePlugin(Raven, this.MockVue);

      this.MockVue.config.errorHandler(new Error('foo'), {
        $options: {
          propsData: {
            foo: 'bar'
          }
        }
      });

      assert.isTrue(Raven.captureException.calledOnce);

      assert.deepEqual(Raven.captureException.args[0][1].extra, {
        propsData: {
          foo: 'bar'
        },
        componentName: 'anonymous component'
      });
    });

    it('should call the existing error handler', function() {
      var errorHandler = this.sinon.stub();
      this.MockVue.config.errorHandler = errorHandler;
      vuePlugin(Raven, this.MockVue); // should override errorHandler

      var err = new Error('foo');
      var vm = {
        $options: {propsData: {}}
      };
      this.MockVue.config.errorHandler(err, vm);

      assert.isTrue(Raven.captureException.calledOnce);
      assert.isTrue(errorHandler.calledOnce);
      assert.equal(errorHandler.args[0][0], err);
      assert.equal(errorHandler.args[0][1], vm);
    });

    it('should capture lifecycle hook', function() {
      vuePlugin(Raven, this.MockVue);

      this.MockVue.config.errorHandler(
        new Error('foo'),
        {
          $options: {
            propsData: {}
          }
        },
        'mounted'
      );

      assert.isTrue(Raven.captureException.calledOnce);

      assert.deepEqual(Raven.captureException.args[0][1].extra, {
        propsData: {},
        componentName: 'anonymous component',
        lifecycleHook: 'mounted'
      });
    });

    it('should not explode when `vm` is not defined', function() {
      vuePlugin(Raven, this.MockVue);
      assert.doesNotThrow(
        function() {
          this.MockVue.config.errorHandler(new Error('foo'));
        }.bind(this)
      );
    });
  });
});
