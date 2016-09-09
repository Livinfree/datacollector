/**
 * Copyright 2016 StreamSets Inc.
 * <p>
 * Licensed under the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * <p>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.streamsets.pipeline.stage.processor.hive;

import com.streamsets.pipeline.api.ConfigDef;
import com.streamsets.pipeline.lib.el.RecordEL;
import com.streamsets.pipeline.stage.lib.hive.FieldPathEL;

public class DecimalDefaultsConfig {
  @ConfigDef(
      required = true,
      type = ConfigDef.Type.STRING,
      defaultValue = "${record:attribute(str:concat(str:concat('jdbc.', field:field()), '.scale'))}",
      label = "Decimal Scale Expression",
      description = "Expression that defines the scale for decimal fields." +
          " Use the default for data generated by the JDBC Consumer origin." +
          " When using with the JDBC Consumer, make sure the origin creates JDBC namespace header attributes.",
      displayPosition = 40,
      group = "HIVE",
      elDefs = {RecordEL.class, FieldPathEL.class},
      evaluation = ConfigDef.Evaluation.EXPLICIT
  )
  public String scaleExpression;

  @ConfigDef(
      required = true,
      type = ConfigDef.Type.STRING,
      defaultValue = "${record:attribute(str:concat(str:concat('jdbc.', field:field()), '.precision'))}",
      label = "Decimal Precision Expression",
      description = "Expression that defines the precision for decimal fields." +
          " Use the default for data generated by the JDBC Consumer origin." +
          " When using with the JDBC Consumer, make sure the origin creates JDBC namespace header attributes.",
      displayPosition = 30,
      group = "HIVE",
      elDefs = {RecordEL.class, FieldPathEL.class},
      evaluation = ConfigDef.Evaluation.EXPLICIT
  )
  public String precisionExpression;
}
