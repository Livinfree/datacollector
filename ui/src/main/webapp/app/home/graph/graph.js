/**
 * Controller for Graph Pane.
 */

angular
  .module('pipelineAgentApp.home')

  .controller('GraphController', function ($scope, $rootScope, _, api, $translate) {
    var stageCounter = 0,
      SOURCE_STAGE_TYPE = 'SOURCE',
      PROCESSOR_STAGE_TYPE = 'PROCESSOR',
      TARGET_STAGE_TYPE = 'TARGET';

    angular.extend($scope, {
      /**
       * Add Stage Instance to the Pipeline Graph.
       * @param stage
       */
      addStageInstance: function (stage) {
        var xPos = ($scope.pipelineConfig.stages && $scope.pipelineConfig.stages.length) ?
          $scope.pipelineConfig.stages[$scope.pipelineConfig.stages.length - 1].uiInfo.xPos + 300 : 200,
          yPos = 70,
          stageInstance = {
            instanceName: stage.name + (new Date()).getTime(),
            library: stage.library,
            stageName: stage.name,
            stageVersion: stage.version,
            configuration: [],
            uiInfo: {
              label: stage.label + (++stageCounter),
              description: '',
              xPos: xPos,
              yPos: yPos,
              stageType: stage.type
            },
            inputLanes: [],
            outputLanes: []
          };

        if (stage.type !== TARGET_STAGE_TYPE) {
          stageInstance.outputLanes = [stageInstance.instanceName + 'OutputLane' + (new Date()).getTime()];
        }

        angular.forEach(stage.configDefinitions, function (configDefinition) {
          var config = {
            name: configDefinition.name,
            value: configDefinition.defaultValue || undefined
          };

          if(configDefinition.type === 'MODEL') {
            if(configDefinition.model.modelType === 'FIELD_SELECTOR') {
              config.value = [];
            } else if(configDefinition.model.modelType === 'LANE_PREDICATE_MAPPING') {
              config.value = [{
                outputLane: stageInstance.outputLanes[0],
                predicate: ''
              }];
            }
          } else if(configDefinition.type === 'INTEGER') {
            if(config.value) {
              config.value = parseInt(config.value);
            } else {
              config.value = 0;
            }
          } else if(configDefinition.type === 'BOOLEAN' && config.value === undefined) {
            config.value = false;
          } else if(configDefinition.type === 'MAP') {
            config.value = [];
          }

          stageInstance.configuration.push(config);
        });


        if(stage.rawSourceDefinition && stage.rawSourceDefinition.configDefinitions) {

          stageInstance.uiInfo.rawSource = {
            configuration: []
          };

          angular.forEach(stage.rawSourceDefinition.configDefinitions, function (configDefinition) {
            var config = {
              name: configDefinition.name,
              value: configDefinition.defaultValue
            };

            if(configDefinition.type === 'MODEL' && configDefinition.model.modelType === 'FIELD_SELECTOR') {
              config.value = [];
            } else if(configDefinition.type === 'INTEGER') {
              if(config.value) {
                config.value = parseInt(config.value);
              } else {
                config.value = 0;
              }
            }

            stageInstance.uiInfo.rawSource.configuration.push(config);
          });
        }

        if(stage.icon) {
          stageInstance.uiInfo.icon = 'rest/v1/definitions/stages/icon?name=' + stage.name +
            '&library=' + stage.library + '&version=' + stage.version;
        } else {
          switch(stage.type) {
            case SOURCE_STAGE_TYPE:
              stageInstance.uiInfo.icon = 'assets/stage/defaultSource.svg';
              break;
            case PROCESSOR_STAGE_TYPE:
              stageInstance.uiInfo.icon = 'assets/stage/defaultProcessor.svg';
              break;
            case TARGET_STAGE_TYPE:
              stageInstance.uiInfo.icon = 'assets/stage/defaultTarget.svg';
              break;
          }
        }







        $scope.updateDetailPaneObject(stageInstance, stage);
        $scope.$broadcast('addNode', stageInstance);
      },

      /**
       * Returns label of the Stage Instance.
       *
       * @param stageInstanceName
       * @returns {*|string}
       */
      getStageInstanceLabel: function (stageInstanceName) {
        var instance;
        angular.forEach($scope.pipelineConfig.stages, function (stageInstance) {
          if (stageInstance.instanceName === stageInstanceName) {
            instance = stageInstance;
          }
        });
        return (instance && instance.uiInfo) ? instance.uiInfo.label : undefined;
      },

      /**
       * Returns message string of the issue.
       *
       * @param stageInstanceName
       * @param issue
       * @returns {*}
       */
      getIssuesMessage: function (stageInstanceName, issue) {
        var msg = issue.message;

        if (issue.level === 'STAGE_CONFIG') {
          var stageInstance = _.find($scope.pipelineConfig.stages, function (stage) {
            return stage.instanceName === stageInstanceName;
          });

          if (stageInstance) {
            msg += ' : ' + getConfigurationLabel(stageInstance, issue.configName);
          }
        }

        return msg;
      },

      /**
       * On clicking issue in Issues dropdown selects the stage and if issue level is STAGE_CONFIG
       * Configuration is
       * @param issue
       * @param instanceName
       */
      onIssueClick: function(issue, instanceName) {
        var pipelineConfig = $scope.pipelineConfig,
          stageInstance;

        if(instanceName) {
          //Select stage instance
          stageInstance = _.find(pipelineConfig.stages, function(stage) {
            return stage.instanceName === instanceName;
          });
          $scope.changeStageSelection(stageInstance);
          //$('.configuration-tabs a:last').tab('show');
        } else {
          //Select Pipeline Config
          $scope.$broadcast('selectNode');
          $scope.changeStageSelection();
        }
      },

      /**
       * On Start Pipeline button click.
       *
       */
      startPipeline: function() {
        if($rootScope.common.pipelineStatus.state !== 'RUNNING') {
          var startResponse;
          api.pipelineAgent.startPipeline($scope.activeConfigInfo.name, 0).
            then(
              function (res) {
                startResponse = res.data;
                return api.pipelineAgent.getPipelineMetrics();
              },
              function (data) {
                $rootScope.common.errors = [data];
              }
            ).
            then(
              function (res) {
                $rootScope.common.pipelineMetrics = res.data;
                $rootScope.common.pipelineStatus = startResponse;
              },
              function (data) {
                $rootScope.common.errors = [data];
              }
            );
        } else {
          $translate('home.graphPane.startErrorMessage', {
            name: $rootScope.common.pipelineStatus.name
          }).then(function(translation) {
            $rootScope.common.errors = [translation];
          });
        }
      },

      /**
       * On Stop Pipeline button click.
       *
       */
      stopPipeline: function() {
        api.pipelineAgent.stopPipeline().
          success(function(res) {
            $rootScope.common.pipelineStatus = res;
            $scope.$broadcast('updateErrorCount', {});
          }).
          error(function(data) {
            $rootScope.common.errors = [data];
          });
      }

    });

    /**
     * Returns label of Configuration for given Stage Instance object and Configuration Name.
     *
     * @param stageInstance
     * @param configName
     * @returns {*}
     */
    var getConfigurationLabel = function (stageInstance, configName) {
      var stageDefinition = _.find($scope.stageLibraries, function (stage) {
          return stageInstance.library === stage.library &&
            stageInstance.stageName === stage.name &&
            stageInstance.stageVersion === stage.version;
        }),
        configDefinition = _.find(stageDefinition.configDefinitions, function (configDefinition) {
          return configDefinition.name === configName;
        });

      return configDefinition ? configDefinition.label : configName;
    };

  });