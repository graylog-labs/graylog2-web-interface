package lib

/*
 * Copyright 2012-2015 TORCH GmbH, 2015 Graylog, Inc.
 *
 * This file is part of Graylog.
 *
 * Graylog is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Graylog is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Graylog.  If not, see <http://www.gnu.org/licenses/>.
 */

import play.api.mvc.{Result, _}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

/**
  * Adds an "X-UA-Compatible: IE=edge" header to all responses to make effing IE happy.
  *
  * @see <a href="https://msdn.microsoft.com/en-us/library/ff955275.aspx">X-UA-Compatibility Meta Tag and HTTP Response Header</a>
  */
class UserAgentCompatibleHeader extends Filter {

  def apply(nextFilter: (RequestHeader) => Future[Result])
           (requestHeader: RequestHeader): Future[Result] = {

    nextFilter(requestHeader).map { result =>
      if (!result.header.headers.contains("X-UA-Compatible")) {
        result.withHeaders("X-UA-Compatible" -> "IE=edge")
      } else {
        result
      }
    }
  }
}
